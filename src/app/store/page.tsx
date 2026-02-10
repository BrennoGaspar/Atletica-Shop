'use client'

import PersonalCart from '@/components/cart'
import ProductCard from '@/components/itemField'
import NavBar from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function StorePage() {

  const router = useRouter()  

  // SESSION
  useEffect(() => {
    const session = localStorage.getItem('session:user');
    if (!session) {
      router.push('/');
    }
  }, []);

  const [products, setProducts] = useState<any[]>([])

  async function Fetch() {
    const { data, error } = await supabase
      .from('products')
      .select()

    if (error) {
      console.log('ERRO: ', error)
    } else {
      setProducts(data || [])
    }
  }

  useEffect(() => {
    Fetch()
  }, [])

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (

    <>
      <header>
        <NavBar onOpenCart={() => setIsCartOpen(true)} />

        <PersonalCart open={isCartOpen} setOpen={setIsCartOpen} />
      </header>
      <main>
        <div className="container mx-auto p-6">
          <h1 className="text-white text-2xl font-bold mb-8">Loja da Atlética</h1>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
              />
            ))}

            {/* if the database is empty */}
            {products.length === 0 && (
              <p className="text-slate-400">Carregando produtos ou estoque vazio...</p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}