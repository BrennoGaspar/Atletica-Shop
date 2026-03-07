'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

interface QuantityModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number) => void
  productName: string
  maxStock?: number // Adicionado para evitar que peçam mais do que tem
}

export default function QuantityModal({ isOpen, onClose, onConfirm, productName, maxStock = 99 }: QuantityModalProps) {
  const [quantity, setQuantity] = useState(1)

  // Reseta a quantidade para 1 toda vez que o modal abre
  useEffect(() => {
    if (isOpen) setQuantity(1)
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm(quantity)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[150]">
      {/* Backdrop com desfoque pesado */}
      <DialogBackdrop className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
      
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-3xl bg-slate-900 border border-white/5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm p-8">
            
            <div className="text-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">
                Seleção de Quantidade
              </span>
              <DialogTitle as="h3" className="text-xl font-bold text-white leading-tight">
                {productName}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-2 uppercase font-medium tracking-widest">
                Quantas unidades você deseja?
              </p>
              
              {/* Seletor de Quantidade */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex size-12 items-center justify-center rounded-2xl border border-white/10 text-white hover:bg-white/5 active:scale-90 transition-all"
                > 
                  <MinusIcon className="size-5" />
                </button>
                
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-white w-12 text-center font-mono">
                    {quantity}
                  </span>
                </div>
                
                <button 
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  className="flex size-12 items-center justify-center rounded-2xl border border-white/10 text-white hover:bg-white/5 active:scale-90 transition-all"
                > 
                  <PlusIcon className="size-5" />
                </button>
              </div>

              {maxStock < 5 && (
                <p className="mt-4 text-[10px] text-amber-500 font-bold uppercase animate-pulse">
                  Resta(m) apenas {maxStock} no estoque!
                </p>
              )}
            </div>

            <div className="mt-10 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl bg-white/5 px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-indigo-600 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Adicionar
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}