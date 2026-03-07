'use client'

import { useState } from 'react'

interface Props {
    title: string
    buttonMessage: string
    onSubmitAction: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function RegisterForm({ title, buttonMessage, onSubmitAction }: Props) {
    const [isLoading, setIsLoading] = useState(false)

    // Função para formatar o telefone automaticamente
    const formatPhone = (value: string) => {
        // Remove tudo que não for número
        let numbers = value.replace(/\D/g, '')
        // Limita a 11 dígitos
        numbers = numbers.substring(0, 11)

        // Formata conforme o tamanho
        if (numbers.length <= 2) return `(${numbers}`
        if (numbers.length <= 6) return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`
        if (numbers.length <= 10) return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`
        return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        onSubmitAction(e)
        // O loading é controlado pelo fluxo de redirect ou erro no componente pai
        setTimeout(() => setIsLoading(false), 3000)
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                <img 
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" 
                    alt="Atlética Logo" 
                    className="mx-auto h-12 w-auto drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                />
                <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-white italic uppercase">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-widest">
                    Crie seu perfil em nossa loja
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-slate-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    
                    {/* Nome Completo - Ocupa 2 colunas */}
                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
                            Nome Completo
                        </label>
                        <input 
                            id="name" 
                            type="text" 
                            placeholder="Ex: Paulo José da Silva" 
                            name="name" 
                            required 
                            className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Idade */}
                    <div>
                        <label htmlFor="age" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
                            Idade
                        </label>
                        <input 
                            id="age" 
                            type="number" 
                            name="age" 
                            placeholder="19" 
                            min="16"
                            max="99"
                            required 
                            className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Telefone */}
                    <div>
                        <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
                            WhatsApp
                        </label>
                        <input
                            id="phone"
                            type="text"
                            name="phone"
                            placeholder="(12) 98765-4321"
                            maxLength={15}
                            onChange={(e) => {
                                e.target.value = formatPhone(e.target.value)
                            }}
                            required
                            className="w-full p-3 rounded-lg bg-gray-900 text-white"
                        />
                    </div>

                    {/* Email - Ocupa 2 colunas */}
                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
                            E-mail
                        </label>
                        <input 
                            id="email" 
                            type="email" 
                            placeholder="seu@email.com" 
                            name="email" 
                            required 
                            autoComplete="email" 
                            className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Senha - Ocupa 2 colunas */}
                    <div className="sm:col-span-2">
                        <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
                            Senha de Acesso
                        </label>
                        <input 
                            id="password" 
                            type="password" 
                            placeholder="Mínimo 6 caracteres" 
                            name="password" 
                            minLength={6}
                            required 
                            className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="sm:col-span-2 pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processando...
                                </>
                            ) : buttonMessage}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                    Já é um membro?{' '}
                    <a href="/" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
                        Acesse sua conta
                    </a>
                </p>
            </div>
        </div>
    )
}