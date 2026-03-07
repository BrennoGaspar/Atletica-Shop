'use client'

import { useEffect } from 'react'

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName }: ConfirmDeleteProps) {
  
  // Travar o scroll da página quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md scale-100 rounded-3xl bg-gray-950 border border-white/5 p-8 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no card feche o modal
      >
        <div className="flex flex-col items-center text-center">
          {/* Alert Icon com Pulsação */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-8 ring-red-500/5">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Excluir Produto?</h3>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            Você está prestes a remover permanentemente <br />
            <span className="font-bold text-white text-base">"{itemName}"</span> do catálogo. <br />
            <span className="text-red-400/80 text-xs font-medium uppercase tracking-widest mt-2 block">Esta ação é irreversível</span>
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 rounded-2xl bg-red-600 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-500 shadow-xl shadow-red-600/20 active:scale-95 transition-all"
            >
              Confirmar Exclusão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}