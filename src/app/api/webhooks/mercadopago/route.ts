import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {

    const body = await request.json();

    console.log("🔔 WEBHOOK RECEBIDO:", JSON.stringify(body, null, 2));

    // Mercado Pago pode enviar o ID em formatos diferentes
    const paymentId = body?.data?.id || body?.id;

    if (!paymentId) {
      console.log("⚠️ Evento ignorado - sem paymentId");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Buscar pagamento no Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log("💳 STATUS PAGAMENTO:", paymentData.status);

    // Só processa pagamentos aprovados
    if (paymentData.status !== "approved") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const userId = paymentData.metadata?.user_id;

    if (!userId) {
      console.log("⚠️ Pagamento sem metadata.user_id");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Evitar duplicidade
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("payment_id", String(paymentId))
      .maybeSingle();

    if (existingOrder) {
      console.log("⚠️ Pedido já processado:", existingOrder.id);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Buscar itens do carrinho
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from("cart_items")
      .select(`
        quantity,
        products (
          id,
          name,
          price,
          quantity
        )
      `)
      .eq("user_id", userId);

    if (cartError) {
      console.error("❌ Erro ao buscar carrinho:", cartError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!cartItems || cartItems.length === 0) {
      console.log("⚠️ Carrinho vazio para user:", userId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Calcular total
    let totalAmount = 0;

    for (const item of cartItems as any) {
      totalAmount += item.products.price * item.quantity;
    }

    // Criar pedido
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        total_price: totalAmount,
        status: "pago",
        payment_id: String(paymentId),
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ Erro ao criar pedido:", orderError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log("📦 Pedido criado:", newOrder.id);

    // Registrar itens e atualizar estoque
    for (const item of cartItems as any) {

      // Registrar snapshot do item
      const { error: itemError } = await supabaseAdmin
        .from("order_items")
        .insert({
          order_id: newOrder.id,
          product_name: item.products.name,
          price_at_purchase: item.products.price,
          quantity: item.quantity,
        });

      if (itemError) {
        console.error("❌ Erro ao salvar item:", itemError);
      }

      // Atualizar estoque
      const newStock = item.products.quantity - item.quantity;

      const { error: stockError } = await supabaseAdmin
        .from("products")
        .update({ quantity: newStock })
        .eq("id", item.products.id);

      if (stockError) {
        console.error("❌ Erro ao atualizar estoque:", stockError);
      }
    }

    // Limpar carrinho
    const { error: deleteError } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("❌ Erro ao limpar carrinho:", deleteError);
    }

    console.log("🛒 Carrinho limpo");

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {

    console.error("🔥 ERRO CRÍTICO NO WEBHOOK:", error);

    // Retorna 200 para evitar loop infinito do Mercado Pago
    return NextResponse.json({ received: true }, { status: 200 });
  }
}