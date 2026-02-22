'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, ClipboardDocumentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export default function PixCheckout() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Estado para armazenar os dados reais do PIX vindos da API
  const [pixData, setPixData] = useState<{ qr_code: string; copy_paste: string; payment_id: number } | null>(null)

  const router = useRouter()

  useEffect(() => {
    async function initCheckout() {
      const savedUser = localStorage.getItem('session:user')
      if (!savedUser) {
        router.push('/')
        return
      }
      
      const parsedUser = JSON.parse(savedUser)
      const userData = Array.isArray(parsedUser) ? parsedUser[0] : parsedUser
      setUser(userData)

      const { data } = await supabase
        .from('cart_items')
        .select(`quantity, products (id, name, price)`)
        .eq('user_id', userData.id)

      if (data && data.length > 0) {
        setCartItems(data)
      } else {
        // Se o carrinho estiver vazio, volta para a loja
        router.push('/store')
      }
      setLoading(false)
    }
    initCheckout()
  }, [router])

  const subtotal = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0)

  async function handleFinalizeOrder() {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal,
          email: user?.email,
          userId: user?.id
        })
      });

      // Se o servidor retornar erro (400, 500, etc), ele cai aqui
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro na comunicação com o servidor');
      }

      const data = await res.json();

      if (data.qr_code) {
        setPixData({
          qr_code: data.qr_code,
          copy_paste: data.copy_paste,
          payment_id: data.id
        });
      }

    } catch (error: any) {
      console.error("Erro completo no fetch:", error);
      alert("Falha ao gerar PIX: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmPayment() {
    if (!user || !pixData || cartItems.length === 0) return;

    try {
      console.log("Iniciando checkout. Itens no carrinho:", cartItems);

      // 1. Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_price: subtotal,
          status: 'pendente',
          payment_id: String(pixData.payment_id)
        })
        .select().single();

      if (orderError) throw orderError;

      // 2. Loop de reserva de estoque
      for (const item of cartItems) {
        // DEBUG: Vamos ver se o ID existe
        const productId = item.products?.id || item.product_id;
        
        if (!productId) {
          alert("Erro: ID do produto não encontrado no item: " + item.products?.name);
          continue; // Pula para o próximo para não travar tudo
        }

        console.log(`Tentando baixar estoque do produto ID: ${productId}, Quantidade: ${item.quantity}`);

        // BUSCA O ESTOQUE REAL AGORA
        const { data: currentProd } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', productId)
          .single();

        if (!currentProd) {
          console.error(`Produto ${productId} não encontrado na tabela products`);
          continue;
        }

        const novoEstoque = currentProd.quantity - item.quantity;

        // ATUALIZAÇÃO NO BANCO
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: novoEstoque })
          .eq('id', productId);

        if (updateError) throw updateError;

        // Registrar o item no pedido
        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: productId,
          product_name: item.products?.name || 'Produto',
          price_at_purchase: item.products?.price || 0,
          quantity: item.quantity
        });
      }

      // 3. Limpar carrinho
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      console.log("Tudo pronto! Redirecionando...");
      router.push('/store/purchased');

    } catch (error: any) {
      console.error("ERRO NO PROCESSO:", error);
      alert("Erro crítico: " + error.message);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )

  return (
    <div className="bg-gray-800/50 min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header da Página */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">Finalizar Compra</h2>
          <p className="text-indigo-100 text-sm opacity-90">Pagamento via PIX</p>
        </div>

        <div className="p-8">
          {/* Mostra o QR Code se já foi gerado, senão mostra o resumo */}
          {!pixData ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-slate-500 text-xs font-bold uppercase mb-3">Resumo do Pedido</h3>
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1 text-slate-700">
                    <span>{item.quantity}x {item.products.name}</span>
                    <span className="font-medium">R$ {(item.products.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-3 pt-3 flex justify-between items-center text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-green-600 font-mono">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalizeOrder}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              {/* QR CODE REAL */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-inner mb-6">
                <img 
                  src={`data:image/jpeg;base64,${pixData.qr_code}`} 
                  alt="QR Code PIX" 
                  className="w-64 h-64"
                />
              </div>

              {/* COPIA E COLA */}
              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest text-center">Código Copia e Cola</p>
                <div className="flex items-center gap-3">
                  <input 
                    readOnly 
                    value={pixData.copy_paste}
                    className="bg-transparent text-[11px] text-slate-600 truncate flex-1 outline-none font-mono"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.copy_paste)
                      alert("Copiado!")
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <ClipboardDocumentIcon className="size-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl hover:bg-green-600 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="size-6" />
                Já realizei o pagamento
              </button>
            </div>
          )}

          <button 
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 text-slate-400 mt-6 text-sm font-medium hover:text-slate-600 transition"
          >
            <ArrowLeftIcon className="size-4" />
            Voltar
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-500 text-xs text-center max-w-[250px]">
        O pagamento é processado com segurança via Mercado Pago. O estoque será reservado por 30 minutos.
      </p>
    </div>
  )
}