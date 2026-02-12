'use client'

import ProductCard from '@/components/itemField'
import NavBar from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import ConfirmDeleteModal from '@/components/confirmDeleteModel'

export default function StorePage() {

    const router = useRouter()

    const [products, setProducts] = useState<any[]>([])
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null)

    // SESSION
    useEffect(() => {
        const session = localStorage.getItem('session:admin');
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
            setProducts(data || [])
        }
    }

    useEffect(() => {
        Fetch()
    }, [])

    // DELETE PRODUCT   
    async function handleDelete(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            console.log('Erro ao deletar:', error)
        } else {
            setProducts(products.filter(p => p.id !== id))
        }
    }

    // CONFIRM DELETE PRODUCT
    function triggerDelete(id: string, name: string) {
        setItemToDelete({ id, name });
        setIsDeleteModalOpen(true);
    }

    async function confirmDelete() {
        if (!itemToDelete) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', itemToDelete.id);

        if (!error) {
            setProducts(products.filter(p => p.id !== itemToDelete.id));
        }
    }

    return (

        <>
            <header>
                <NavBar onOpenCart={() => { }} isAdmin={true}/>

            </header>
            <main>
                <div className="container mx-auto p-6">
                    <h1 className="text-white text-2xl font-bold mb-8">Loja da Atlética</h1>

                    <button
                        className='group relative flex items-center mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-indigo-500/50 border border-white/10 overflow-hidden'
                        onClick={() => { router.push('/admin/addItem') }}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />

                        <PlusCircleIcon className='w-6 h-6 mr-2 transition-transform group-hover:rotate-90 duration-300' />

                        <span className='text-sm uppercase tracking-widest'>Adicionar</span>
                    </button>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                quantity={product.quantity}
                                imageUrl={product.imageUrl}
                                onAddClick={() => { }}
                                onDeleteClick={() => triggerDelete(product.id, product.name)}
                                isAdmin={true}
                            />
                        ))}

                        <ConfirmDeleteModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={confirmDelete}
                            itemName={itemToDelete?.name || ""}
                        />

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
        </>
    )
}