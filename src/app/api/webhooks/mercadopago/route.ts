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
      const userId = paymentData.metadata.user_id;

      // 1. ATTEMPT TO FIND THE ORDER CREATED BY FRONTEND
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, status')
        .eq('payment_id', String(paymentId))
        .single();

      // 2. IF ORDER IS ALREADY MARKED AS 'pago', STOP HERE TO AVOID DUPLICATE STOCK DEDUCTION
      if (existingOrder && existingOrder.status === 'pago') {
        return NextResponse.json({ message: 'O pagamento já foi processado' }, { status: 200 });
      }

      // 3. UPDATE STATUS OR CREATE THE ORDER IF IT DOESN'T EXIST
      if (existingOrder) {
        // Just update existing pending order
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'pago' })
          .eq('id', existingOrder.id);

        if (updateError) throw updateError;
      } else {
        // Fallback: Create order from scratch if frontend button wasn't clicked
        const { data: cartItemsFallback } = await supabase
          .from('cart_items')
          .select(`quantity, products (id, name, price, quantity)`)
          .eq('user_id', userId);

        if (cartItemsFallback && cartItemsFallback.length > 0) {
          const totalAmount = cartItemsFallback.reduce((acc, item: any) => acc + (item.products.price * item.quantity), 0);
          
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

          // Register items snapshot for the new order
          for (const item of cartItemsFallback as any) {
            await supabase.from('order_items').insert({
              order_id: newOrder.id,
              product_name: item.products.name,
              price_at_purchase: item.products.price,
              quantity: item.quantity
            });
          }
        }
      }

      // 4. COMMON ACTIONS: UPDATE STOCK AND CLEAR CART
      // This runs regardless of how the order was created/updated above
      const { data: finalCartItems } = await supabase
        .from('cart_items')
        .select(`quantity, products (id, quantity)`)
        .eq('user_id', userId);

      if (finalCartItems && finalCartItems.length > 0) {
        for (const item of finalCartItems as any) {
          // Decrease stock
          await supabase.from('products')
            .update({ quantity: item.products.quantity - item.quantity })
            .eq('id', item.products.id);
        }

        // Clear the user's cart
        await supabase.from('cart_items').delete().eq('user_id', userId);
        console.log(`O estoque foi atualizado e o carrinho do usuário: ${userId} foi limpo!`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro crítico de webhook:', error.message);
    return NextResponse.json({ error: 'Erro interno de processamento' }, { status: 200 });
  }
}