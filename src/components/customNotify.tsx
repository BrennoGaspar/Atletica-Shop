'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Props {
    title: string;
    description: string;
    onClose: () => void;
}

export default function CustomAlert({ title, description, onClose }: Props) {
    // Nota: O estado 'open' é controlado pelo componente pai. 
    // Se este componente for renderizado, assumimos que open={true}.

    return (
        <Dialog open={true} onClose={onClose} className="relative z-[120]">
            {/* Backdrop com desfoque */}
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 duration-300"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-2xl bg-slate-900 text-left shadow-2xl border border-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-closed:scale-95 duration-300 sm:my-8 sm:w-full sm:max-w-lg"
                    >
                        {/* Botão fechar no canto superior */}
                        <div className="absolute right-4 top-4">
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>

                        <div className="px-6 pt-6 pb-4">
                            <div className="sm:flex sm:items-start">
                                {/* Ícone de Alerta */}
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 sm:mx-0 sm:size-10">
                                    <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-amber-500" />
                                </div>

                                <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <DialogTitle as="h3" className="text-lg font-bold text-white tracking-tight">
                                        {title}
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer do Modal */}
                        <div className="bg-white/[0.02] px-6 py-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 sm:w-auto"
                            >
                                Entendido
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}