'use client'

import NavBar from '@/components/navbar'
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
    age: number
  }
}

export default function StorePage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('session:admin');
    if (!session) {
      router.push('/');
    } else {
      FetchData()
    }
  }, []);

  async function FetchData() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_price,
          status,
          users ( name, age )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as any || [])
    } catch (error) {
      console.log('Erro ao buscar dados: ', error)
    } finally {
      setLoading(false)
    }
  }

  // Lógica para transformar os pedidos em dados para o gráfico
  const chartData = useMemo(() => {
    const dailyData = orders.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.total_price;
      return acc;
    }, {});

    // Converte o objeto em array e inverte para ordem cronológica (esquerda -> direita)
    return Object.keys(dailyData).map(date => ({
      date,
      valor: dailyData[date]
    })).reverse();
  }, [orders]);

  return (
    <>
      <header>
        <NavBar onOpenCart={() => {}} isAdmin={true} />
      </header>
      
      <main className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-white text-2xl font-bold mb-6">Dashboard de Vendas</h1>
          
          {/* SEÇÃO DO GRÁFICO */}
          <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-xl">
            <h2 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Renda Diária (R$)</h2>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#818cf8" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {loading ? 'Carregando gráfico...' : 'Sem dados para exibir o gráfico'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABELA DE PEDIDOS (Mantida do passo anterior) */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-white/10 bg-gray-900">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Idade</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Valor Total</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-400">#{order.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{order.users?.name}</td>
                  <td className="px-6 py-4">{order.users?.age} anos</td>
                  <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 font-bold text-white">R$ {order.total_price?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'pago' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}