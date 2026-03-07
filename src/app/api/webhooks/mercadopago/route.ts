import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O Mercado Pago envia o ID de formas diferentes. Capturamos todas.
    const paymentId = body.data?.id || body.id;

    // Se não for um evento de pagamento, apenas ignoramos
    if (!paymentId || (body.type && body.type !== 'payment')) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      const userId = paymentData.metadata.user_id;

      // 1. Evitar duplicidade: Verifica se já existe um pedido 'pago' com esse ID
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_id', String(paymentId))
        .single();

      if (existingOrder) {
        return NextResponse.json({ message: "Já processado" }, { status: 200 });
      }

      // 2. Buscar itens do carrinho para o snapshot do pedido
      const { data: cartItems } = await supabaseAdmin
        .from('cart_items')
        .select(`quantity, products (id, name, price, quantity)`)
        .eq('user_id', userId);

      if (cartItems && cartItems.length > 0) {
        const totalAmount = cartItems.reduce((acc, item: any) => 
          acc + (item.products.price * item.quantity), 0
        );

        // 3. Criar o Pedido Oficial
        const { data: newOrder, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: userId,
            total_price: totalAmount,
            status: 'pago',
            payment_id: String(paymentId)
          })
          .select().single();

        if (orderError) throw orderError;

        // 4. Registrar Itens do Pedido e Atualizar Estoque
        for (const item of cartItems as any) {
          // Registrar Snapshot do item
          await supabaseAdmin.from('order_items').insert({
            order_id: newOrder.id,
            product_name: item.products.name,
            price_at_purchase: item.products.price,
            quantity: item.quantity
          });

          // Baixar o estoque real do produto
          await supabaseAdmin.from('products')
            .update({ quantity: item.products.quantity - item.quantity })
            .eq('id', item.products.id);
        }

        // 5. Limpar o carrinho do usuário
        await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro crítico no Webhook:', error.message);
    // Retornamos 200 para o Mercado Pago não ficar reenviando o erro infinitamente
    return NextResponse.json({ error: 'Erro interno' }, { status: 200 });
  }
}