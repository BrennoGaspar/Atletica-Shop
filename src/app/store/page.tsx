'use client'

import ProductCard from '@/components/itemField'
import { supabase } from '@/lib/supabase'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export default function StorePage() {

  const [ products, setProducts ] = useState<any[]>([])

  async function Fetch(){
    const { data, error } = await supabase
      .from('products')
      .select()

    if( error ) {
      console.log('ERRO: ', error)
    } else {
      setProducts(data || [])
    }
  }

  useEffect(() => {
    Fetch()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-white text-2xl font-bold mb-8">Loja da Atlética</h1>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {/* Agora mapeamos os produtos que vieram do Fetch() */}
        {products.map((product) => (
          <ProductCard 
            key={product.id}
            id={product.id} 
            name={product.name} 
            price={product.price} 
          />
        ))}

        {/* Se o banco estiver vazio, mostra uma mensagem amigável */}
        {products.length === 0 && (
          <p className="text-slate-400">Carregando produtos ou estoque vazio...</p>
        )}
      </div>
    </div>
  )
}