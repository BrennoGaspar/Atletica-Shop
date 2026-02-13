import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        const { amount, email, userId } = await request.json();

        const payment = new Payment(client);

        const body = {
            transaction_amount: amount,
            description: 'Compra Loja Atlética',
            payment_method_id: 'pix',
            payer: {
                email: email,
            },
        };

        const response = await payment.create({ body });

        // Retorna os dados necessários para o frontend exibir o QR Code
        return NextResponse.json({
            id: response.id,
            qr_code: response.point_of_interaction?.transaction_data?.qr_code_base64,
            copy_paste: response.point_of_interaction?.transaction_data?.qr_code,
        });

    } catch (error: any) {
        // Adicione este log para ver o erro real no seu TERMINAL
        console.error('ERRO DETALHADO DO MERCADO PAGO:', error.response?.data || error.message);

        return NextResponse.json({ error: 'Erro ao gerar PIX' }, { status: 500 });
    }
}