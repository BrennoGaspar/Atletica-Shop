'use client'

import NavBar from '@/components/navbar'
// Importamos ambos para decidir qual usar baseando-se na segurança
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface OrderData {
  id: string
  created_at: string
  total_price: number
  status: string
  users: {
    name: string
    email: string
    phone: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [ordersDashboard, setOrdersDashboard] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  // AUTH & SESSION CHECK
  useEffect(() => {
    async function loadDashboardData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Se não houver sessão, apenas pare a execução. 
      // O Middleware cuidará de expulsar o usuário da rota se necessário.
      if (!session) return;

      // Busca os dados em paralelo para melhor performance
      await Promise.all([fetchOrders(), fetchDashboardStats()]);
    }
    
    loadDashboardData();
  }, [supabase]);

  /**
   * IMPORTANTE RLS:
   * Se você usar o 'supabase' (anon_key) aqui, a query retornará VAZIA ou ERRO
   * a menos que você tenha uma política RLS que permita admins lerem tudo.
   * * DICA: Se este dashboard for apenas para você, o ideal é que esta busca 
   * seja feita via Server Component ou uma API Route que use o 'supabaseAdmin'.
   */
  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_price,
          status,
          users ( name, email, phone )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as any || [])
    } catch (error: any) {
      console.error('Erro RLS/Fetch Orders: ', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchDashboardStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_price,
          status,
          users ( name, email, phone )
        `)
        .eq('status', 'pago')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrdersDashboard(data as any || [])
    } catch (error: any) {
      console.error('Erro RLS/Fetch Stats: ', error.message)
    }
  }

  // Transform order data for Recharts
  const chartData = useMemo(() => {
    const dailyData = ordersDashboard.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(order.total_price);
      return acc;
    }, {});

    return Object.keys(dailyData).map(date => ({
      date,
      valor: dailyData[date]
    })).reverse();
  }, [ordersDashboard]);

  return (
    <>
      <header>
        <NavBar onOpenCart={() => {}} isAdmin={true} />
      </header>
      
      <main className="container mx-auto p-6 space-y-8 min-h-screen bg-slate-950">
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Visão Geral</p>
              <h1 className="text-white text-3xl font-extrabold">Dashboard de Vendas</h1>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs uppercase">Total Pago</p>
              <p className="text-green-500 text-2xl font-mono font-bold">
                R$ {ordersDashboard.reduce((acc, curr) => acc + Number(curr.total_price), 0).toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Sales Area Chart */}
          <div className="bg-gray-900/50 border border-white/5 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
            <h2 className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">Faturamento Diário</h2>
            <div className="h-[350px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorValor)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 italic">
                  {loading ? 'Sincronizando dados...' : 'Nenhuma venda aprovada para exibir no gráfico'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Management Table */}
        <div className="bg-gray-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/5 bg-gray-800/30">
            <h3 className="text-white font-semibold">Últimos Pedidos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-[10px] text-gray-500 uppercase bg-gray-950/50 tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID Pedido</th>
                  <th className="px-6 py-4">Cliente / Contato</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Faturamento</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] text-indigo-400/70 group-hover:text-indigo-400">
                      {order.id.split('-')[0]}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{order.users?.name || 'Usuário Desconhecido'}</span>
                        <span className="text-[11px] text-slate-500">{order.users?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-white font-mono">
                      R$ {Number(order.total_price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        order.status === 'pago' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && !loading && (
              <div className="p-10 text-center text-slate-600">Nenhum pedido registrado no sistema.</div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}