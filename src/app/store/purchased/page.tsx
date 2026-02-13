'use client'

import NavBar from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'

interface OrderData {
  id: string
  created_at: string
  total_price: number
  status: string
  users: {
    name: string
    email: string
  }
}

export default function StorePage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('session:user');
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
          users ( name, email )
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

  return (
    <>
      <header>
        <NavBar onOpenCart={() => {}} isAdmin={true} />
      </header>
      
      <main className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-white text-2xl font-bold mb-6">Suas compras</h1>
        </div>

        {/* Items for table */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-white/10 bg-gray-900">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Email</th>
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
                  <td className="px-6 py-4">{order.users?.email}</td>
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