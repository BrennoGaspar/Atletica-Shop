'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/navbar'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    quantity: 1,
    imageUrl: ''
  })

  // 1. Carregar os dados atuais do produto
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Erro ao carregar produto:', error)
        router.push('/store') // Volta se der erro
      } else {
        setFormData({
          name: data.name,
          price: data.price,
          quantity: data.quantity,
          imageUrl: data.imageUrl || ''
        })
      }
      setLoading(false)
    }

    loadProduct()
  }, [productId, router])

  // 2. Função para salvar as alterações
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        price: formData.price,
        quantity: formData.quantity,
        imageUrl: formData.imageUrl
      })
      .eq('id', productId)

    if (error) {
      alert('Erro ao atualizar produto: ' + error.message)
    } else {
      alert('Produto atualizado com sucesso!')
      router.push('/admin')
    }
    setUpdating(false)
  }

  if (loading) return <div className="p-10 text-white">Carregando dados...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar onOpenCart={() => {}} isAdmin={true} />
      
      <main className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-white">Editar Produto</h1>

        <form onSubmit={handleUpdate} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Nome do Produto</label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Preço (R$)</label>
            <input 
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Quantidade</label>
            <input 
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">URL da Imagem</label>
            <input 
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.imageUrl && (
                <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2">Preview:</p>
                    <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-slate-700" />
                </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={updating}
              className="flex-1 bg-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {updating ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}