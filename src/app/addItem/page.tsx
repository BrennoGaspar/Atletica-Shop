'use client'

import NavBar from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function StorePage() {

  const router = useRouter()  

  // SESSION
  useEffect(() => {
    const session = localStorage.getItem('session:admin');
    if (!session) {
      router.push('/');
    }
  }, []);

  async function AddData(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // don't reload the page

    const formData = new FormData(event.currentTarget);
    const nameForm = formData.get('name') as string;
    const priceForm = Number(formData.get('price'));

    const { error } = await supabase
        .from('products')
        .insert({ name: nameForm, price: priceForm })

    if( error ){
        console.log('Erro ao adicionar novo item: ', error)
    } else {
        router.push('/admin')
    }
  }

  return (
    <>
      <header>
        <NavBar onOpenCart={() => {}} />
      </header>
      
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black px-4">
        {/* Card do Formulário */}
        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Novo Produto</h2>
            <p className="text-sm text-gray-400 mt-1">Cadastre itens para a loja da atlética.</p>
          </div>

          <form className="space-y-5" onSubmit={AddData}>
            {/* Campo: Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Nome do Produto
              </label>
              <input 
                id="name" 
                type="text" 
                name="name" 
                placeholder="Ex: Camiseta de Jogo"
                required 
                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" 
              />
            </div>

            {/* Campo: Preço */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <input 
                  id="price" 
                  type="number" 
                  name="price" 
                  step="0.01"
                  placeholder="0,00"
                  required 
                  className="block w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>
            </div>

            {/* Botão de Submit */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Cadastrar Item
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}