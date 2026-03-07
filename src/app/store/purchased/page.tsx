'use client'

import PersonalCart from '@/components/cart'
import NavBar from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShoppingBag, Calendar, CreditCard, ChevronRight, Package } from 'lucide-react'

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

export default function MyPurchasesPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/')
        return
      }
      fetchOrders(authUser.id)
    }
    checkSession()
  }, [router])

  async function fetchOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          total_price, 
          status, 
          users:user_id ( name, email )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as any || [])
    } catch (error: any) {
      console.error('Erro ao buscar histórico: ', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      case 'pendente':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
      case 'cancelado':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50">
        <NavBar onOpenCart={() => setIsCartOpen(true)} isAdmin={false} />
        <PersonalCart open={isCartOpen} setOpen={setIsCartOpen} />
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight flex items-center gap-3">
              <ShoppingBag className="text-indigo-500 w-10 h-10" />
              Minhas Compras
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Gerencie seus pedidos da Atlética IFSP em tempo real.</p>
          </div>
          <div className="text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            Total de {orders.length} pedidos
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-mono text-xs tracking-widest uppercase animate-pulse">Sincronizando banco...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length > 0 ? (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="group relative overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 md:p-6 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.05)]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                          <Package className="text-indigo-500 w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-600">Protocolo</p>
                          <p className="font-mono text-sm text-indigo-400 uppercase">#{order.id.split('-')[0]}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 md:px-10">
                        <div className="space-y-1">
                          <span className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <Calendar className="w-3 h-3 text-indigo-500" /> Data
                          </span>
                          <p className="text-sm text-slate-200">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <CreditCard className="w-3 h-3 text-indigo-500" /> Total
                          </span>
                          <p className="text-sm font-black text-white">R$ {Number(order.total_price).toFixed(2)}</p>
                        </div>
                        <div className="md:flex flex-col justify-center items-center hidden">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(order.status)}`}>
                              {order.status}
                           </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <span className={`md:hidden px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                            {order.status}
                        </span>
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] rounded-3xl border border-dashed border-white/10">
                <div className="p-6 bg-white/5 rounded-full mb-6 text-slate-700">
                  <ShoppingBag size={48} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center px-6">Você ainda não garantiu seus produtos da Atlética!</h3>
                <p className="text-slate-500 mb-8 max-w-sm text-center px-6 leading-relaxed">
                  Confira os novos produtos exclusivos da AAAACH em nossa loja.
                </p>
                <button 
                  onClick={() => router.push('/store')}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  Explorar Loja
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}