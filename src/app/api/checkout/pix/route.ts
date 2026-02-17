import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const { amount, email, userId } = await request.json();

    // FETCH ITEMS FROM CART
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        products (id, name, price, quantity)
      `)
      .eq('user_id', userId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio ou não encontrado' }, { status: 400 });
    }

    // VERIFY
    let calculatedTotal = 0;
    for (const item of cartItems as any) {
      const stockAvailable = item.products.quantity;
      const quantityRequested = item.quantity;
      const currentPrice = item.products.price;

      if (quantityRequested > stockAvailable) {
        return NextResponse.json({ 
          error: `O produto ${item.products.name} acabou de esgotar ou possui estoque insuficiente.` 
        }, { status: 400 });
      }

      calculatedTotal += currentPrice * quantityRequested;
    }

    // VALIDATION OF VALUE
    if (Math.abs(calculatedTotal - amount) > 0.01) {
      return NextResponse.json({ error: 'Divergência de valores detectada.' }, { status: 400 });
    }

    // GENERATE PAYMENT METHOD
    const payment = new Payment(client);
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: calculatedTotal,
        description: 'Compra Loja Atlética',
        payment_method_id: 'pix',
        payer: { email },
        metadata: {
          user_id: userId
        }
      }
    });

    return NextResponse.json({
      id: paymentResponse.id,
      qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      copy_paste: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
    });

  } catch (error: any) {
    console.error('Erro no Checkout API:', error);
    return NextResponse.json({ error: 'Falha ao processar pagamento' }, { status: 500 });
  }
}