import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    // CATCH THE PAYMENT ID
    const paymentId = body.data?.id || searchParams.get('id');

    // VALIDATION
    if (paymentId === '123456' || !paymentId) {
      return NextResponse.json({ message: 'ID de teste ou vazio recebido' }, { status: 200 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      // SEARCH THE ORDER THAT FRONTEND CREATED
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, status')
        .eq('payment_id', String(paymentId))
        .single();

      // IF ORDER EXISTS AND IS PAYED
      if (existingOrder && existingOrder.status === 'pago') {
        return NextResponse.json({ message: 'Pagamento já processado anteriormente' }, { status: 200 });
      }

      // IF ORDER IS 'pendente' - UPDATE 'status'
      if (existingOrder) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'pago' })
          .eq('id', existingOrder.id);

        if (updateError) throw updateError;
        
        console.log(`Pedido #${existingOrder.id} atualizado para PAGO via Webhook.`);
      } 
      
      // IF ORDER NOT EXISTS
      else {
        const userId = paymentData.metadata.user_id;

        const { data: cartItems } = await supabase
          .from('cart_items')
          .select(`quantity, products (id, name, price, quantity)`)
          .eq('user_id', userId);

        if (cartItems && cartItems.length > 0) {
          const totalAmount = cartItems.reduce((acc, item: any) => acc + (item.products.price * item.quantity), 0);

          const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              total_price: totalAmount,
              status: 'pago',
              payment_id: String(paymentId)
            })
            .select().single();

          if (orderError) throw orderError;

          // REGISTER ITEMS AND STOCK
          for (const item of cartItems as any) {
            await supabase.from('order_items').insert({
              order_id: newOrder.id,
              product_name: item.products.name,
              price_at_purchase: item.products.price,
              quantity: item.quantity
            });

            await supabase.from('products')
              .update({ quantity: item.products.quantity - item.quantity })
              .eq('id', item.products.id);
          }

          // CLEAR THE CART
          await supabase.from('cart_items').delete().eq('user_id', userId);
          console.log(`Pedido criado do zero via Webhook (Frontend falhou ou foi fechado).`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro crítico no Webhook:', error.message);
    return NextResponse.json({ error: 'Erro interno processado' }, { status: 200 });
  }
}