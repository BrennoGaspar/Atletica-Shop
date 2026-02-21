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

      // 2. IF ORDER IS ALREADY MARKED AS 'pago', STOP HERE
      if (existingOrder && existingOrder.status === 'pago') {
        return NextResponse.json({ message: 'Payment already processed' }, { status: 200 });
      }

      // 3. CASE A: ORDER ALREADY EXISTS (Reserved by Frontend)
      if (existingOrder) {
        // If it was 'expirado', the cleanup route already returned the stock.
        // If it's 'pendente', stock is already reserved.
        // We just update the status to 'pago'.
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'pago' })
          .eq('id', existingOrder.id);

        if (updateError) throw updateError;
        
        console.log(`Order #${existingOrder.id} updated to PAID.`);
      } 
      
      // 4. CASE B: ORDER DOES NOT EXIST (Frontend button wasn't clicked)
      else {
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select(`quantity, products (id, name, price, quantity)`)
          .eq('user_id', userId);

        if (cartItems && cartItems.length > 0) {
          const totalAmount = cartItems.reduce((acc, item: any) => acc + (item.products.price * item.quantity), 0);

          // Create order from scratch
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

          // Process items, deduct stock and clear cart
          for (const item of cartItems as any) {
            await supabase.from('order_items').insert({
              order_id: newOrder.id,
              product_id: item.products.id,
              product_name: item.products.name,
              price_at_purchase: item.products.price,
              quantity: item.quantity
            });

            // Deduct stock (since frontend didn't do it)
            await supabase.from('products')
              .update({ quantity: item.products.quantity - item.quantity })
              .eq('id', item.products.id);
          }

          // Clear the user's cart
          await supabase.from('cart_items').delete().eq('user_id', userId);
          console.log(`Order created and stock deducted via Webhook (Fallback).`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro crítico de webhook:', error.message);
    return NextResponse.json({ error: 'Erro interno de processamento' }, { status: 200 });
  }
}