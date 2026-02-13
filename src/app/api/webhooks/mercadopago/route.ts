import { supabase } from "@/lib/supabase";
import { MercadoPagoConfig, Payment } from "mercadopago"; // Importação da configuração adicionada
import { NextResponse } from "next/server";

// Inicialização do cliente com o seu Token de Produção
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    // Captura o ID tanto do corpo (webhook) quanto da URL (IPN/Teste)
    const paymentId = body.data?.id || searchParams.get('id');

    // Se for o ID de teste '123456', retornamos 200 para o Mercado Pago validar a URL
    if (paymentId === '123456' || !paymentId) {
      return NextResponse.json({ message: 'Teste ou ID vazio' }, { status: 200 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    // Verifica se o pagamento foi aprovado
    if (paymentData.status === 'approved') {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'pago' })
        .eq('payment_id', paymentId);

      if (error) {
        console.error('Erro ao atualizar o Supabase:', error.message);
        throw error;
      }
      
      console.log(`Pedido com Payment ID ${paymentId} atualizado para 'pago'.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no Webhook:', error.message);
    // Retornamos 200 para o Mercado Pago parar de tentar reenviar em caso de erro de lógica
    return NextResponse.json({ error: 'Processado com ressalvas' }, { status: 200 });
  }
}