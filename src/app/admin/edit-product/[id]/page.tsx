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

  // 1. Carregar dados do produto ao montar a página
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Erro ao carregar produto:', error.message);
        router.replace('/admin');
      } else if (data) {
        setFormData({
          name: data.name,
          price: data.price,
          quantity: data.quantity,
          imageUrl: data.imageUrl || ''
        });
      }
      setLoading(false);
    }

    loadProduct();
  }, [productId, router]);

  // 2. Função de Salvamento Robusta
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updating) return; // Trava para evitar cliques duplos
    
    setUpdating(true);

    try {
      // 1. Valida o usuário antes de enviar (Garante que o ID 97e39d1a... está ativo)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        alert("Sessão não encontrada. Por favor, faça login novamente.");
        router.push('/login');
        return;
      }

      // 2. Executa a atualização no Supabase
      const { data, error } = await supabase
        .from('products')
        .update({
          name: formData.name.trim(),
          price: Number(formData.price),
          quantity: Math.floor(Number(formData.quantity)),
          imageUrl: formData.imageUrl.trim()
        })
        .eq('id', Number(productId)) // Garante que o ID é tratado como int8 (numérico)
        .select(); // Retorna o objeto alterado para confirmar o sucesso

      if (error) throw error;

      // 3. Verifica se a linha foi realmente afetada (Se data for [], o RLS barrou)
      if (data && data.length > 0) {
        alert('Produto atualizado com sucesso na Atlética Shop!');
        router.push('/admin');
      } else {
        console.error("Erro de RLS: O ID do usuário não bate com a política do banco.");
        alert('Erro de permissão: Sua conta não tem autorização para editar este produto.');
      }

    } catch (err: any) {
      console.error('❌ Erro na operação:', err.message);
      alert(`Falha ao salvar: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar onOpenCart={() => {}} isAdmin={true} />
      
      <main className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Atlética Shop - Gestão</p>
            <h1 className="text-3xl font-extrabold text-white">Editar Produto</h1>
        </div>

        <form onSubmit={handleUpdate} className="bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-tighter">Nome do Produto</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-tighter">Preço (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-tighter">Quantidade em Estoque</label>
            <input 
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-tighter">URL da Imagem</label>
            <input 
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.imageUrl && (
                <div className="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-white/5 inline-block">
                    <p className="text-[10px] text-slate-500 mb-3 uppercase font-bold">Pré-visualização:</p>
                    <img src={formData.imageUrl} alt="Preview" className="w-40 h-40 object-cover rounded-xl shadow-lg" />
                </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 rounded-2xl border border-white/5 font-bold hover:bg-white/5 transition-all text-slate-400"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={updating}
              className="flex-1 bg-indigo-600 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {updating ? 'Salvando...' : 'Confirmar Edição'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}