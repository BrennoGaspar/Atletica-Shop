import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        created_at,
        total_price,
        status,
        users:user_id ( name, email, phone )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar pedidos admin:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}