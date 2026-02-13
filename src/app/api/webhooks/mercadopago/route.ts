import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const paymentId = body.data?.id || searchParams.get('id');

    if (paymentId === '123456' || !paymentId) {
      return NextResponse.json({ message: 'Teste ou ID vazio' }, { status: 200 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      // 1. Verificar se esse pedido já foi processado para evitar duplicidade
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_id', paymentId)
        .single();

      if (existingOrder) {
        return NextResponse.json({ message: 'Pedido já processado' }, { status: 200 });
      }

      // 2. Buscar metadados (passamos o userId no checkout)
      // Nota: No checkout, enviaremos o userId via external_reference ou metadata
      const userId = paymentData.metadata.user_id;

      // 3. Buscar itens do carrinho atual para registrar a compra
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`quantity, products (id, name, price, quantity)`)
        .eq('user_id', userId);

      if (cartItems && cartItems.length > 0) {
        const totalAmount = cartItems.reduce((acc, item: any) => acc + (item.products.price * item.quantity), 0);

        // 4. Criar o pedido na tabela 'orders'
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            total_price: totalAmount,
            status: 'pago',
            payment_id: paymentId
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 5. Registrar itens na tabela 'order_items' (Snapshot) e baixar estoque
        for (const item of cartItems as any) {
          // Inserir item do pedido
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_name: item.products.name,
            price_at_purchase: item.products.price,
            quantity: item.quantity
          });

          // Baixar estoque
          await supabase.from('products')
            .update({ quantity: item.products.quantity - item.quantity })
            .eq('id', item.products.id);
        }

        // 6. Limpar o carrinho do usuário
        await supabase.from('cart_items').delete().eq('user_id', userId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 200 });
  }
}