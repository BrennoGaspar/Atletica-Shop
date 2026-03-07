'use client'

import { useState } from 'react'
import { Check, ShieldCheck, ShieldAlert } from 'lucide-react'

interface Props {
    title: string
    buttonMessage: string
    onSubmitAction: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function RegisterForm({ title, buttonMessage, onSubmitAction }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [phoneValue, setPhoneValue] = useState('')
    const [password, setPassword] = useState('')

    // 1. Regras de Validação de Senha (Incluindo Minúscula)
    const passwordRequirements = {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password), // <-- Nova regra adicionada
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&]/.test(password),
    }

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '')
        if (digits.length === 0) return ''
        if (digits.length <= 2) return `(${digits}`
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneValue(formatPhone(e.target.value))
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        onSubmitAction(e)
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
                <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-white italic uppercase leading-tight">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-widest">
                    Crie seu perfil na loja
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-slate-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    
                    {/* Campos de Nome, Idade, WhatsApp e Email (Mantidos iguais) */}
                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">Nome Completo</label>
                        <input id="name" type="text" name="name" placeholder="Ex: Joaquim da Silva" required className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">Idade</label>
                        <input id="age" type="number" name="age" min="0" required className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">WhatsApp</label>
                        <input id="phone" type="text" name="phone" placeholder="(11) 98765-4321" value={phoneValue} onChange={handlePhoneChange} required className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">E-mail</label>
                        <input id="email" type="email" name="email" placeholder="seu@email.com" required className="block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    {/* Senha com Verificação de Minúscula */}
                    <div className="sm:col-span-2">
                        <label htmlFor="password" className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500 ml-1 mb-2">
                            Senha de Acesso
                            {isPasswordValid ? 
                                <span className="text-green-500 flex items-center gap-1">Forte <ShieldCheck size={14}/></span> : 
                                <span className="text-amber-500 flex items-center gap-1">Fraca <ShieldAlert size={14}/></span>
                            }
                        </label>
                        <input 
                            id="password" 
                            type="password" 
                            name="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            className={`block w-full rounded-xl bg-white/5 border ${isPasswordValid ? 'border-green-500/50' : 'border-white/10'} px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none`} 
                        />
                        
                        {/* Indicadores de Requisitos Atualizados */}
                        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2 px-1">
                            <Requirement label="8+ Caracteres" met={passwordRequirements.length} />
                            <Requirement label="Letra Maiúscula" met={passwordRequirements.hasUpper} />
                            <Requirement label="Letra Minúscula" met={passwordRequirements.hasLower} />
                            <Requirement label="Número" met={passwordRequirements.hasNumber} />
                            <Requirement label="Símbolo (@$!)" met={passwordRequirements.hasSpecial} />
                        </div>
                    </div>

                    <div className="sm:col-span-2 pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading || !isPasswordValid}
                            className="flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Processando..." : buttonMessage}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function Requirement({ label, met }: { label: string; met: boolean }) {
    return (
        <div className={`flex items-center gap-1.5 transition-colors duration-300 ${met ? 'text-green-400' : 'text-slate-600'}`}>
            <div className={`p-0.5 rounded-full ${met ? 'bg-green-500/20' : 'bg-slate-800'}`}>
                <Check size={10} strokeWidth={4} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
        </div>
    )
}