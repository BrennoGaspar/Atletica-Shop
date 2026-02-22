'use client'

import CustomAlertTimer from '@/components/alert'
import PersonalCart from '@/components/cart'
import ProductCard from '@/components/itemField'
import NavBar from '@/components/navbar'
import QuantityModal from '@/components/quantityModal'
import { supabase } from '@/lib/supabase'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function StorePage() {

  const router = useRouter()  

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([]) 
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0);
  const sucessType = true

  // SESSION
  useEffect(() => {
    const session = localStorage.getItem('session:user');
    if (!session) {
      router.push('/');
    }
  }, []);

  async function Fetch() {
    const { data, error } = await supabase
      .from('products')
      .select()

    if (error) {
      console.log('ERRO: ', error)
    } else {
      console.log('DADOS DO BANCO: ', data)
      setProducts(data || [])
    }
  }

  useEffect(() => {
    Fetch()
  }, [])

  // ADD ITEM TO CART WITH POP-UP
  const handleAddToCartClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  async function refreshCartCount() {
    const sessionData = localStorage.getItem('session:user');
    const userList = sessionData ? JSON.parse(sessionData) : null;
    const userId = Array.isArray(userList) ? userList[0]?.id : userList?.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId);

    if (error) {
      console.error("Erro ao atualizar contador:", error);
      return;
    }

    const totalItems = data?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    
    setCartCount(totalItems); 
  }

  const confirmAddToCart = async (quantityToAdd: number) => {
    const sessionData = localStorage.getItem('session:user');
    const userList = sessionData ? JSON.parse(sessionData) : null;
    const userId = Array.isArray(userList) ? userList[0]?.id : userList?.id;

    if (!userId || !selectedProduct) return;

    try {
      // 1. Fetch current stock and existing cart item in parallel
      const [productRes, cartRes] = await Promise.all([
        supabase.from('products').select('quantity').eq('id', selectedProduct.id).single(),
        supabase.from('cart_items').select('id, quantity').eq('user_id', userId).eq('product_id', selectedProduct.id).single()
      ]);

      const stockAvailable = productRes.data?.quantity || 0;
      const quantityInCart = cartRes.data?.quantity || 0;
      const totalDesired = quantityInCart + quantityToAdd;

      // 2. Stock validation
      if (totalDesired > stockAvailable) {
        alert(`Erro! O máximo de unidades disponíveis desse produto (estoque + seu carrinho) é ${stockAvailable}.`);
        return;
      }

      // 3. Update existing item OR Insert new one
      if (cartRes.data) {
        // THE FIX: Use cartRes.data.id to identify the specific row to update
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: totalDesired })
          .eq('id', cartRes.data.id); // Fixed: .id instead of .quantity

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: selectedProduct.id,
            quantity: quantityToAdd
          });

        if (insertError) throw insertError;
      }

      // 4. Success feedback
      setIsModalOpen(false);
      setIsAlertOpen(true);
      refreshCartCount();

    } catch (error: any) {
      console.error("Erro na operação de carrinho:", error.message);
      alert("Erro ao adicionar produto. Tente novamente.");
    }
  }

  return (

    <>
      <header>
        <NavBar onOpenCart={() => setIsCartOpen(true)} isAdmin={false}/>

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
                quantity={product.quantity}
                imageUrl={product.imageUrl}
                onAddClick={() => handleAddToCartClick(product)}
                onDeleteClick={() => {}}
                isAdmin={false}
              />
            ))}

            {/* if the database is empty */}
            {products.length === 0 && (
              <div className='flex gap-4'>
                {/* LOADING - BLUE */}
                <svg aria-hidden="true" className="inline w-8 h-8 animate-spin text-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" 
                        fill="rgba(0,0,0,0.1)" 
                    />
                    <path 
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" 
                        fill="currentColor"
                    />
                </svg>
                <p className="text-slate-400">Carregando produtos ou estoque vazio...</p>
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

      <CustomAlertTimer open={isAlertOpen} setOpen={setIsAlertOpen}
        title='Sucesso!'
        description='Item adicionado à sacola'
        sucessType={sucessType}
      />
    </>
  )
}