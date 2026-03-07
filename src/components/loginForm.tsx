"use client"

import { useState } from 'react'

interface Props {
    title: string
    buttonMessage: string
    button: boolean
    onSubmitAction: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function LoginForm({ title, buttonMessage, button, onSubmitAction }: Props) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        onSubmitAction(e)
        // O estado de loading é resetado pelo componente pai ao tratar o erro ou sucesso
        // mas aqui garantimos o feedback imediato.
        setTimeout(() => setIsLoading(false), 2000) 
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 animate-in fade-in duration-700">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img 
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" 
                    alt="Logo Atlética" 
                    className="mx-auto h-12 w-auto drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                />
                <h2 className="mt-10 text-center text-3xl font-extrabold tracking-tight text-white italic uppercase">
                    {title}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">
                            Email
                        </label>
                        <div className="mt-2">
                            <input 
                                id="email" 
                                placeholder="seu@email.com" 
                                type="email" 
                                name="email" 
                                required 
                                autoComplete="email" 
                                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">
                                Senha
                            </label>
                        </div>
                        <div className="mt-2">
                            <input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                name="password" 
                                required 
                                autoComplete="current-password" 
                                className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                            />
                        </div>
                    </div>

                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Autenticando...
                                </div>
                            ) : buttonMessage}
                        </button>
                    </div>
                </form>

                {button && (
                    <p className="mt-10 text-center text-sm text-gray-400">
                        Ainda não faz parte?{' '}
                        <a href="/signup" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
                            Cadastre-se aqui
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}