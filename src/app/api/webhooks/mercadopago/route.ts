import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O Mercado Pago envia notificações de vários tipos. Queremos apenas 'payment'.
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === 'approved') {
        const userId = paymentData.metadata.user_id;

        // 1. Verificar se já processamos esse pagamento para não duplicar
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_id', String(paymentId))
          .single();

        if (existingOrder) return NextResponse.json({ ok: true });

        // 2. Buscar itens do carrinho para o snapshot do pedido e estoque
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select(`quantity, products (id, name, price, quantity)`)
          .eq('user_id', userId);

        if (cartItems && cartItems.length > 0) {
          // 3. Criar o Pedido (Status: pago)
          const total = cartItems.reduce((acc, item: any) => acc + (item.products.price * item.quantity), 0);
          
          const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              total_price: total,
              status: 'pago',
              payment_id: String(paymentId)
            })
            .select().single();

          if (orderErr) throw orderErr;

          // 4. Inserir itens e baixar estoque (Transaction-like loop)
          for (const item of cartItems as any) {
            // Registrar item no pedido
            await supabase.from('order_items').insert({
              order_id: order.id,
              product_name: item.products.name,
              price_at_purchase: item.products.price,
              quantity: item.quantity
            });

            // Subtrair do estoque real
            await supabase.from('products')
              .update({ quantity: item.products.quantity - item.quantity })
              .eq('id', item.products.id);
          }

          // 5. Limpar carrinho
          await supabase.from('cart_items').delete().eq('user_id', userId);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}