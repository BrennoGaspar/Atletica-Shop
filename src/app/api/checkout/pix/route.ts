import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const { amount, email, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    // FETCH ITEMS FROM CART
    // Usamos o cast ::text implicitamente no eq() ou garantimos que o ID seja string
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select(`
        quantity,
        products (id, name, price, quantity)
      `)
      .eq('user_id', String(userId)); // Garante que o ID vá como string para o UUID do Postgres

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio ou não encontrado' }, { status: 400 });
    }

    // VERIFY STOCK AND CALCULATE TOTAL
    let calculatedTotal = 0;
    for (const item of cartItems as any) {
      const stockAvailable = item.products.quantity;
      const quantityRequested = item.quantity;
      const currentPrice = item.products.price;

      if (quantityRequested > stockAvailable) {
        return NextResponse.json({ 
          error: `O produto ${item.products.name} possui apenas ${stockAvailable} unidades em estoque.` 
        }, { status: 400 });
      }

      calculatedTotal += currentPrice * quantityRequested;
    }

    // VALIDATION OF VALUE INTEGRITY
    // Compara com uma margem de erro para evitar problemas de arredondamento de float
    if (Math.abs(calculatedTotal - amount) > 0.01) {
      return NextResponse.json({ error: 'Divergência de valores detectada.' }, { status: 400 });
    }

    // GENERATE MERCADO PAGO PAYMENT
    const payment = new Payment(client);
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: Number(calculatedTotal.toFixed(2)),
        description: 'Compra Loja Atlética (A.A.A.A.C.H)',
        payment_method_id: 'pix',
        payer: { email },
        metadata: {
          user_id: userId // Importante: Esse metadata será usado pelo Webhook para saber quem pagou
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
    return NextResponse.json({ error: 'Falha ao processar pagamento no servidor' }, { status: 500 });
  }
}