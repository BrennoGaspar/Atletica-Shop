import Image from 'next/image'
import minhaImagem from '@/assets/aaaach.jpg'
import { ShoppingBagIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface ProductProps {
    id: number
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
        router.push(`/admin/edit-product/${id}`);
    };

    return (
        <div className="relative group bg-slate-900 flex flex-col p-5 w-full max-w-[320px] rounded-2xl border border-slate-800 shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
            
            {/* Delete Button */}
            { isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick();
                    }}
                    className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/20 active:scale-90"
                    title="Remover Item"
                >
                    <TrashIcon className="size-5" />
                </button>
            )}

            {/* Image Container */}
            <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-xl bg-slate-800">
                {imageUrl ? (
                    <img 
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                ) : (
                    // Placeholder
                    <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs">
                        Sem imagem
                    </div>
                )}
            </div>

            {/* Product Informations */}
            <div className="flex flex-col gap-1 px-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Atlética</span>
                <h3 className="text-white font-bold text-xl truncate">{name}</h3>
                
                <div className="flex flex-col mt-2 mb-4">
                    <p className="text-2xl font-black text-white">
                        <span className="text-sm font-normal text-slate-400 mr-1">R$</span>
                        {price.toFixed(2)}
                    </p>
                    
                    {/* Badge de Estoque */}
                    <p className={`text-xs mt-1 font-medium ${quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {quantity > 0 ? `${quantity} unidades em estoque` : 'Produto esgotado'}
                    </p>
                </div>
            </div>

            {/* Buy/Edit Button */}
            { isAdmin ? (
                <button 
                    onClick={handleEditRedirect} // Chama a função de redirecionamento
                    className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-amber-700 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-95 shadow-lg shadow-amber-900/20"
                >
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-700 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                        <div className="relative h-full w-10 bg-white/20" />
                    </div>

                    <PencilSquareIcon className="size-5 transition-transform group-hover:-rotate-12" />
                    <span>Editar produto</span>
                </button>
            ) : (
               <button 
                    disabled={quantity <= 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddClick();
                    }}
                    className={`group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-bold text-white transition-all shadow-lg 
                        ${quantity > 0 
                            ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-900/20' 
                            : 'bg-slate-700 cursor-not-allowed opacity-60' // CURSOR BLOCKED
                        }`}
                >
                    <ShoppingBagIcon className="size-5" />
                    <span>{quantity > 0 ? 'Adicionar na sacola' : 'Esgotado'}</span>
                </button>
            )}
        </div>
    )
}