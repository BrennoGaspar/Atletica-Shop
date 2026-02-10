'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import minhaImagem from '@/assets/aaaach.jpg'

interface CartProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PersonalCart({ open, setOpen }: CartProps) {

  const [cartItems, setCartItems] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  // SESSION USER
  useEffect(() => {
    const savedUser = localStorage.getItem('session:user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      
      // parsed returns an Array
      if (Array.isArray(parsed)) {
        setUser(parsed[0]); 
      } else {
        setUser(parsed);
      }
    }
  }, []);

  // SHOPPING CART
  async function FetchData() {

  const actualId = Array.isArray(user) ? user[0]?.id : user?.id;
  if (!actualId) return;

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price
      )
    `)
    .eq('user_id', actualId)

  if (error) {
    console.log('Erro ao carregar carrinho: ', error)
    return
  }

  setCartItems(data || []);
}

  // REMOVE ITEM SHOPPING CART
  async function handleRemove(id: number) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao remover:", error);
      return;
    }

    // REMOVE WITHOUT REFRESH
    setCartItems((current) => current.filter((item) => item.id !== id));
  }

  // USE EFFECT
  useEffect(() => {
    if (open && user?.id) {
      FetchData();
    }
  }, [open, user]);

  // CALC OF SUBTOTAL
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.products?.price * item.quantity)
  }, 0)

  return (
    <div>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">Carrinho</DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Fechar</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <li key={item.id} className="flex py-6">
                              <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <Image alt='Imagem' src={minhaImagem || 'https://placehold.co/150'} className="size-full object-cover" />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <a>{item.products.name}</a>
                                  </h3>
                                  <p className="ml-4">R$ {(item.products.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <p className="text-gray-500">Quantidade: {item.quantity}</p>

                                  <div className="flex">
                                    <button type="button" onClick={() => handleRemove(item.id)} className="font-medium text-indigo-600 hover:text-indigo-500">
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Total</p>
                      <p>R${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="mt-6">
                      <a
                        href="#"
                        className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700"
                      >
                        Ir para pagamento
                      </a>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}