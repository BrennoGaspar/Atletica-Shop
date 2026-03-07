'use client'

import { ShoppingBagIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface ProductProps {
    id: string | number // Suporta UUID ou BigInt
    name: string
    price: number
    quantity: number
    imageUrl?: string
    isAdmin: boolean
    onAddClick: () => void
    onDeleteClick: () => void
}

export default function ProductCard({ id, name, price, quantity, imageUrl, isAdmin, onAddClick, onDeleteClick }: ProductProps) {
    const router = useRouter()

    const handleEditRedirect = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Garante que o redirecionamento aponte para a rota correta de edição
        router.push(`/admin/edit-product/${id}`);
    };

    return (
        <div className="relative group bg-slate-900 flex flex-col p-5 w-full max-w-[320px] rounded-3xl border border-white/5 shadow-2xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-500/10">
            
            {/* Delete Button - Somente Admin */}
            { isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick();
                    }}
                    className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white shadow-lg active:scale-90"
                    title="Remover Item"
                >
                    <TrashIcon className="size-5" />
                </button>
            )}

            {/* Image Container */}
            <div className="relative aspect-square w-full mb-5 overflow-hidden rounded-2xl bg-slate-800/50">
                {imageUrl ? (
                    <img 
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                        Sem Imagem
                    </div>
                )}
                
                {/* Overlay de Esgotado */}
                {quantity <= 0 && !isAdmin && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                            Esgotado
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-1 px-1 flex-grow">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Loja Atlética</span>
                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">{name}</h3>
                
                <div className="flex flex-col mt-2 mb-6">
                    <p className="text-2xl font-black text-white font-mono">
                        <span className="text-xs font-medium text-slate-500 mr-1 uppercase">R$</span>
                        {Number(price).toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${quantity > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${quantity > 0 ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                            {quantity > 0 ? `${quantity} disponíveis` : 'Sem estoque'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
                { isAdmin ? (
                    <button 
                        onClick={handleEditRedirect}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-amber-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-amber-500 active:scale-95 shadow-lg shadow-amber-900/20"
                    >
                        <PencilSquareIcon className="size-4 transition-transform group-hover:-rotate-12" />
                        <span>Editar</span>
                    </button>
                ) : (
                   <button 
                        disabled={quantity <= 0}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddClick();
                        }}
                        className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all shadow-xl 
                            ${quantity > 0 
                                ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-900/20' 
                                : 'bg-slate-800 cursor-not-allowed opacity-50' 
                            }`}
                    >
                        <ShoppingBagIcon className="size-4" />
                        <span>{quantity > 0 ? 'Adicionar' : 'Esgotado'}</span>
                    </button>
                )}
            </div>
        </div>
    )
}