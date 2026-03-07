'use client'

import ProductCard from '@/components/itemField'
import NavBar from '@/components/navbar'
// Importamos o cliente padrão. O RLS deve permitir SELECT para todos (público)
// mas o DELETE só funcionará se a política de admin estiver correta.
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

    // SESSION & AUTH CHECK
    useEffect(() => {
        async function fetchProducts() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });

            if (error) console.error('Erro:', error.message);
            else setProducts(data || []);
        }
        fetchProducts();
    }, []);

    // FETCH PRODUCTS
    // Com RLS ativo, a política da tabela 'products' deve permitir SELECT para 'public' ou 'authenticated'
    async function fetchProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('ERRO ao buscar produtos: ', error.message);
        } else {
            setProducts(data || []);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    // TRIGGER DELETE MODAL
    function triggerDelete(id: string, name: string) {
        setItemToDelete({ id, name });
        setIsDeleteModalOpen(true);
    }

    // CONFIRM DELETE PRODUCT
    async function confirmDelete() {
        if (!itemToDelete) return;

        /**
         * IMPORTANTE RLS:
         * Para este .delete() funcionar com o cliente 'supabase' comum, 
         * você deve ter uma política na tabela 'products' que permita DELETE 
         * apenas para usuários onde (auth.jwt() ->> 'email') é o seu email de admin
         * ou se o usuário tiver um role específico.
         */
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', itemToDelete.id);

        if (error) {
            console.error('Erro ao deletar:', error.message);
            alert("Você não tem permissão para deletar produtos ou ocorreu um erro.");
        } else {
            setProducts(prev => prev.filter(p => p.id !== itemToDelete.id));
            setIsDeleteModalOpen(false);
        }
    }

    return (
        <>
            <header>
                <NavBar onOpenCart={() => { }} isAdmin={true}/>
            </header>
            <main className="min-h-screen bg-slate-900">
                <div className="container mx-auto p-6">
                    <h1 className="text-white text-2xl font-bold mb-8">Gestão de Estoque - Atlética</h1>

                    <button
                        className='group relative flex items-center mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-indigo-500/50 border border-white/10 overflow-hidden'
                        onClick={() => { router.push('/admin/addItem') }}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                        <PlusCircleIcon className='w-6 h-6 mr-2 transition-transform group-hover:rotate-90 duration-300' />
                        <span className='text-sm uppercase tracking-widest'>Novo Produto</span>
                    </button>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                {...product} // Spread das propriedades (id, name, price, quantity, imageUrl)
                                onAddClick={() => { }}
                                onDeleteClick={() => triggerDelete(product.id, product.name)}
                                isAdmin={true}
                            />
                        ))}

                        {/* EMPTY STATE / LOADING */}
                        {products.length === 0 && (
                            <div className='col-span-full flex flex-col items-center justify-center py-20 gap-4'>
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 font-medium">Sincronizando com o banco de dados...</p>
                            </div>
                        )}
                    </div>

                    <ConfirmDeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={confirmDelete}
                        itemName={itemToDelete?.name || ""}
                    />
                </div>
            </main>
        </>
    )
}