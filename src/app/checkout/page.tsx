'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

export default function PixCheckout() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pixCopiaCola] = useState("00020126580014BR.GOV.BCB.PIX0136suachavepixaqui...") 
  const router = useRouter()

  useEffect(() => {
    async function loadOrder() {
      const savedUser = localStorage.getItem('session:user')
      if (!savedUser) { router.push('/'); return }
      
      const user = JSON.parse(savedUser)
      const userId = Array.isArray(user) ? user[0]?.id : user?.id

      const { data } = await supabase
        .from('cart_items')
        .select(`quantity, products (id, name, price)`)
        .eq('user_id', userId)

      if (data) setCartItems(data)
      setLoading(false)
    }
    loadOrder()
  }, [])

  const subtotal = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0)

  async function handleFinalizeOrder() {
    if (cartItems.length === 0) return;
    
    setIsProcessing(true)
    const savedUser = localStorage.getItem('session:user')
    const user = JSON.parse(savedUser!)
    const userId = Array.isArray(user) ? user[0]?.id : user?.id

    try {
      // 1. CRIAR O PEDIDO (Tabela 'orders')
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_price: subtotal,
          status: 'pendente' // Começa como pendente até alguém da atlética conferir
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. CRIAR OS ITENS DO PEDIDO (Tabela 'order_items')
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_name: item.products.name,
        price_at_purchase: item.products.price,
        quantity: item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) throw itemsError

      // 3. ATUALIZAR ESTOQUE (Tabela 'products')
      for (const item of cartItems) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.products.id)
          .single()

        await supabase
          .from('products')
          .update({ quantity: (product?.quantity || 0) - item.quantity })
          .eq('id', item.products.id)
      }

      // 4. LIMPAR CARRINHO
      await supabase.from('cart_items').delete().eq('user_id', userId)

      alert("Pedido registrado com sucesso! Sua solicitação foi enviada para a Atlética.")
      router.push('/store')

    } catch (error: any) {
      console.error("Erro ao finalizar:", error.message)
      alert("Erro ao processar pedido. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <div className="text-white p-10 text-center">Carregando...</div>

  return (
    <div className="bg-gray-800/50 min-h-screen p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Pagamento via PIX</h2>
        <p className="text-center text-gray-500 mb-6">Escaneie o QR Code ou cole o código abaixo</p>

        <div className="bg-gray-100 aspect-square w-64 mx-auto mb-6 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
           <p className="text-gray-400 text-sm p-4 text-center italic">QR Code será gerado após validação da chave</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Código Pix Copia e Cola</p>
          <div className="flex items-center gap-2">
            <input 
              readOnly 
              value={pixCopiaCola}
              className="bg-transparent text-xs text-gray-600 truncate flex-1 outline-none"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(pixCopiaCola)}
              className="p-2 hover:bg-gray-200 rounded-full transition"
            >
              <ClipboardDocumentIcon className="size-5 text-indigo-600" />
            </button>
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between font-bold text-lg text-gray-800">
            <span>Total a pagar:</span>
            <span className="text-green-600 font-mono">R$ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={handleFinalizeOrder}
          disabled={isProcessing || cartItems.length === 0}
          className={`w-full text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 ${
            isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isProcessing ? (
            <span className="animate-pulse">Processando...</span>
          ) : (
            <>
              <CheckCircleIcon className="size-6" />
              Já realizei o pagamento
            </>
          )}
        </button>
        
        <button 
          onClick={() => router.back()}
          className="w-full text-gray-400 mt-4 text-sm hover:underline"
        >
          Voltar para o carrinho
        </button>
      </div>
    </div>
  )
}