'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

interface QuantityModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number) => void
  productName: string
}

export default function QuantityModal({ isOpen, onClose, onConfirm, productName }: QuantityModalProps) {
  const [quantity, setQuantity] = useState(1)

  const handleConfirm = () => {
    onConfirm(quantity)
    setQuantity(1) // Reseta para a próxima vez
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/70 transition-opacity" />
      
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-gray-900 border border-white/10 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm p-6">
            <div>
              <DialogTitle as="h3" className="text-lg font-semibold text-white">
                Adicionar {productName}
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-2">Escolha a quantidade desejada:</p>
              
              <div className="mt-4 flex items-center justify-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="size-10 rounded-full border border-gray-600 text-white hover:bg-white/10"
                > - </button>
                
                <span className="text-2xl font-bold text-white w-8 text-center">{quantity}</span>
                
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="size-10 rounded-full border border-gray-600 text-white hover:bg-white/10"
                > + </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Confirmar
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}