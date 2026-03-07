'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface CartProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PersonalCart({ open, setOpen }: CartProps) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const isCartEmpty = cartItems.length === 0;

  // 1. SESSION - Recupera a sessão oficial do Supabase
  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getSession();
  }, []);

  // 2. FETCH DATA - Busca itens do carrinho (RLS filtra por user_id)
  async function fetchData() {
    if (!user?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          price,
          quantity,
          imageUrl
        )
      `)
      .eq('user_id', user.id); // UUID do Auth

    if (error) {
      console.error('Erro ao carregar carrinho:', error.message);
    } else {
      // Filtra itens cujo produto possa ter sido deletado do banco
      const validItems = (data || []).filter(item => item.products !== null);
      setCartItems(validItems);
    }
    setLoading(false);
  }

  // Atualiza sempre que o carrinho abrir
  useEffect(() => {
    if (open && user?.id) {
      fetchData();
    }
  }, [open, user]);

  // 3. REMOVE ITEM - Obedece a política RLS (auth.uid = user_id)
  async function handleRemove(id: number) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao remover:", error.message);
      alert("Não foi possível remover o item.");
      return;
    }

    setCartItems((current) => current.filter((item) => item.id !== id));
  }

  // 4. CHECKOUT VALIDATION
  async function handleGoToCheckout() {
    if (isCartEmpty) return;

    // Re-validação de estoque antes de ir para o checkout
    const { data } = await supabase
      .from('cart_items')
      .select(`quantity, products (name, quantity)`)
      .eq('user_id', user.id);

    const outOfStockItems = (data || []).filter(
      (item: any) => item.quantity > (item.products?.quantity || 0)
    );

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map((i: any) => i.products.name).join(', ');
      alert(`O estoque mudou! Quantidade indisponível para: ${itemNames}.`);
      fetchData();
      return;
    }

    router.push('/checkout');
    setOpen(false);
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.products?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-[60]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-2xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Sua Sacola</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    {loading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <ul role="list" className="-my-6 divide-y divide-gray-100">
                        {cartItems.map((item) => {
                          const isOutOfStock = item.quantity > (item.products?.quantity || 0);
                          return (
                            <li key={item.id} className="flex py-6 transition-all">
                              <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                <img 
                                  alt={item.products?.name} 
                                  src={item.products?.imageUrl || '/placeholder.png'} 
                                  className="size-full object-cover" 
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-bold text-gray-900">
                                    <h3 className="line-clamp-1">{item.products?.name}</h3>
                                    <p className="ml-4 font-mono">R$ {(item.products?.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                  {isOutOfStock && (
                                    <p className="mt-1 text-[10px] font-black text-red-600 uppercase tracking-widest">
                                      Estoque insuficiente
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <p className="text-gray-500 font-medium text-xs uppercase">Qtd: {item.quantity}</p>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemove(item.id)} 
                                    className="font-bold text-red-500 hover:text-red-700 text-xs uppercase tracking-widest transition-colors"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    
                    {isCartEmpty && !loading && (
                       <div className="text-center py-20">
                          <p className="text-gray-400 text-sm">Seu carrinho está vazio.</p>
                       </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <p className="uppercase text-xs tracking-widest text-gray-500">Subtotal</p>
                    <p className="text-xl font-mono">R$ {subtotal.toFixed(2)}</p>
                  </div>
                  <div className="mt-6">
                    <button
                      disabled={isCartEmpty || loading}
                      onClick={handleGoToCheckout}
                      className={`flex w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95
                        ${isCartEmpty 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                    >
                      {isCartEmpty ? 'Sacola Vazia' : 'Ir para o Pagamento'}
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}