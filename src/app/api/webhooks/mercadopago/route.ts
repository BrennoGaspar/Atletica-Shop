import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O Mercado Pago envia o ID em body.data.id ou body.id
    const paymentId = body.data?.id || body.id;

    // Filtra apenas eventos de pagamento
    if (!paymentId || (body.type && body.type !== 'payment')) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      const userId = paymentData.metadata.user_id;

      // 1. Evitar duplicidade usando o payment_id único
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_id', String(paymentId))
        .single();

      if (existingOrder) {
        return NextResponse.json({ message: "Pagamento já processado" }, { status: 200 });
      }

      // 2. Buscar itens do carrinho para processar o pedido
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`quantity, products (id, name, price, quantity)`)
        .eq('user_id', userId);

      if (cartError || !cartItems || cartItems.length === 0) {
        return NextResponse.json({ error: 'Carrinho não encontrado' }, { status: 200 });
      }

      // 3. Calcular total e preparar dados
      const totalAmount = cartItems.reduce((acc, item: any) => 
        acc + (Number(item.products.price) * item.quantity), 0
      );

      // 4. Inserir o pedido (orders)
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_price: totalAmount, // Agora aceita decimais
          status: 'pago',
          payment_id: String(paymentId)
        })
        .select().single();

      if (orderError) throw orderError;

      // 5. Loop para itens do pedido e atualização de estoque
      for (const item of cartItems as any) {
        // Registrar item no histórico (order_items)
        await supabase.from('order_items').insert({
          order_id: newOrder.id,
          product_name: item.products.name,
          price_at_purchase: Number(item.products.price),
          quantity: item.quantity
        });

        // Subtrair do estoque real na tabela products
        const novoEstoque = item.products.quantity - item.quantity;
        await supabase.from('products')
          .update({ quantity: novoEstoque })
          .eq('id', item.products.id);
      }

      // 6. Limpar o carrinho do usuário após sucesso total
      await supabase.from('cart_items').delete().eq('user_id', userId);
      
      console.log(`Pedido ${newOrder.id} processado com sucesso para o usuário ${userId}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro detalhado no Webhook:', error);
    // Retornamos 200 para o Mercado Pago não tentar reenviar infinitamente em caso de erro lógico
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}