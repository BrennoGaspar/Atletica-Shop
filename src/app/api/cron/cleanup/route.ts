import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // 0. SECURITY CHECK: Verify the secret from the URL
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // 1. Find expired pending orders using Admin privileges
    const { data: expiredOrders } = await supabaseAdmin
      .from('orders')
      .select('id, order_items(product_id, quantity)')
      .eq('status', 'pendente')
      .lt('created_at', thirtyMinsAgo);

    if (expiredOrders && expiredOrders.length > 0) {
      for (const order of expiredOrders) {
        // 2. Return items to stock
        for (const item of (order as any).order_items) {
          const { data: p } = await supabaseAdmin
            .from('products')
            .select('quantity')
            .eq('id', item.product_id)
            .single();

          await supabaseAdmin.from('products')
            .update({ quantity: (p?.quantity || 0) + item.quantity })
            .eq('id', item.product_id);
        }

        // 3. Mark as expired
        await supabaseAdmin.from('orders')
          .update({ status: 'expirado' })
          .eq('id', order.id);
      }
    }
    
    console.log(`Cleanup success: ${expiredOrders?.length || 0} orders processed.`);
    return NextResponse.json({ cleaned: true, processed: expiredOrders?.length || 0 });
  } catch (error: any) {
    console.error('Cleanup error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}