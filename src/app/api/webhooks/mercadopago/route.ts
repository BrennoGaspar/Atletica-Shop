import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Ajuste o caminho conforme seu projeto
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O Mercado Pago envia o ID do pagamento no campo data.id ou resource
    const paymentId = body.data?.id || body.resource?.split('/').pop();

    if (body.type === 'payment' && paymentId) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      // Se o status no Mercado Pago for 'approved'
      if (paymentData.status === 'approved') {
        
        // 1. Atualiza o status na tabela 'orders' do Supabase
        const { error } = await supabase
          .from('orders')
          .update({ status: 'pago' })
          .eq('payment_id', paymentId);

        if (error) {
          console.error('Erro ao atualizar banco:', error.message);
          return NextResponse.json({ error: 'Erro no banco' }, { status: 500 });
        }

        console.log(`Pagamento ${paymentId} aprovado e atualizado no banco!`);
      }
    }

    // O Mercado Pago exige um retorno 200 ou 201 para confirmar o recebimento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Erro no Webhook:', error.message);
    return NextResponse.json({ error: 'Webhook falhou' }, { status: 400 });
  }
}