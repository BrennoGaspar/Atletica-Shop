'use client'

import CustomAlertTimer from '@/components/alert'
import PersonalCart from '@/components/cart'
import ProductCard from '@/components/itemField'
import NavBar from '@/components/navbar'
import QuantityModal from '@/components/quantityModal'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, ShoppingBag, Loader2 } from 'lucide-react'

export default function StorePage() {
  const router = useRouter()  

  // Estados de UI e Dados
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([]) 
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  
  // Estados de Usuário
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string>('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // 1. Efeito de Inicialização: Auth + Profile + Products
  useEffect(() => {
    async function initializeStore() {
      let sessionData = null;
      let retries = 5;

      // Loop de verificação ativa (Polling) para garantir que o token foi lido
      const { data: { session } } = await supabase.auth.getSession();
        
      if (!session) {
        router.push('/')
        return
      }

      try {
        const currentUser = session.user;
        setUser(currentUser);

        // Busca o Perfil (maybeSingle para evitar quebra se não houver linha no banco)
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', currentUser.id)
          .maybeSingle();

        // Fallback: se não tiver nome no banco, usa o início do e-mail
        setUserName(profile?.name || currentUser.email?.split('@')[0] || 'Usuário');

        // Carrega dados da loja em paralelo
        await Promise.all([
          fetchProducts(),
          refreshCartCount(currentUser.id)
        ]);

      } catch (error) {
        console.error("Erro ao carregar dados da loja:", error);
      } finally {
        setIsInitialLoading(false);
      }
    }

    initializeStore();
  }, [router]);

  // 2. Busca de Produtos
  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar produtos: ', error.message)
    } else {
      setProducts(data || [])
    }
  }

  // 3. Atualização do Contador do Carrinho
  async function refreshCartCount(userId: string) {
    if (!userId) return;
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId)

    if (error) {
      console.error("Erro no contador:", error.message)
      return
    }

    const totalItems = data?.reduce((acc, item) => acc + item.quantity, 0) || 0
    setCartCount(totalItems) 
  }

  const handleAddToCartClick = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // 4. Lógica de Inserção/Update no Carrinho
  const confirmAddToCart = async (quantityToAdd: number) => {
    if (!user || !selectedProduct) return

    try {
      const [productRes, cartRes] = await Promise.all([
        supabase.from('products').select('quantity').eq('id', selectedProduct.id).single(),
        supabase.from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', selectedProduct.id)
          .maybeSingle()
      ])

      const stockAvailable = productRes.data?.quantity || 0
      const quantityInCart = cartRes.data?.quantity || 0
      const totalDesired = quantityInCart + quantityToAdd

      if (totalDesired > stockAvailable) {
        alert(`Estoque insuficiente! O disponível é ${stockAvailable}.`)
        return
      }

      if (cartRes.data) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: totalDesired })
          .eq('id', cartRes.data.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: selectedProduct.id,
            quantity: quantityToAdd
          })
        if (error) throw error
      }

      setIsModalOpen(false)
      setIsAlertOpen(true)
      refreshCartCount(user.id)

    } catch (error: any) {
      console.error("Erro na operação:", error.message)
      alert("Erro ao processar sua solicitação.")
    }
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">Validando Acesso Atlética Shop...</p>
      </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50">
        <NavBar onOpenCart={() => setIsCartOpen(true)} isAdmin={false} cartCount={cartCount}/>
        <PersonalCart open={isCartOpen} setOpen={setIsCartOpen} />
      </header>

      <main className="min-h-screen bg-slate-950 text-slate-200">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h1 className="text-white text-4xl font-black tracking-tight flex items-center gap-3">
                <ShoppingBag className="text-indigo-500 w-8 h-8" />
                Loja da Atlética
              </h1>
              <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit border border-indigo-500/20">
                <User size={14} strokeWidth={3} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Logado como: {userName}
                </span>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-slate-500 text-xs font-medium">Conta ativa:</p>
              <p className="text-slate-300 text-sm font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddClick={() => handleAddToCartClick(product)}
                onDeleteClick={() => {}} 
                isAdmin={false}
              />
            ))}

            {products.length === 0 && (
              <div className='col-span-full flex flex-col items-center justify-center py-20 space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10'>
                <ShoppingBag size={48} className="text-slate-700" strokeWidth={1} />
                <p className="text-slate-400 font-medium">O estoque está sendo reabastecido...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <QuantityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAddToCart}
        productName={selectedProduct?.name || ''}
      />

      <CustomAlertTimer 
        open={isAlertOpen} 
        setOpen={setIsAlertOpen}
        title='Sucesso!'
        description={`${selectedProduct?.name} foi adicionado à sacola.`}
        sucessType={true}
      />
    </>
  )
}