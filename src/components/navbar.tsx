'use client'

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase' // Importante para o SignOut
import Image from 'next/image'
import minhaImagem from '@/assets/default_user.jpg'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface NavBarProps {
    onOpenCart: () => void
    isAdmin: boolean
    cartCount?: number // Adicionado o contador
}

export default function NavBar({ onOpenCart, isAdmin, cartCount = 0 }: NavBarProps) {
    const router = useRouter() 
    const pathname = usePathname()

    // Configuração de Navegação baseada no Role
    const navigation = isAdmin 
        ? [
            { name: 'Dashboard', href: '/admin' },
            { name: 'Vendas', href: '/admin/purchased' },
          ] 
        : [
            { name: 'Loja', href: '/store' },
            { name: 'Minhas Compras', href: '/store/purchased' },
          ]

    // LOG OUT SYSTEM PROFISSIONAL
    async function handleLogOut() {
        try {
            // 1. Encerra a sessão no Supabase Auth (Limpa cookies e JWT)
            await supabase.auth.signOut()
            
            // 2. Limpa resquícios do localStorage
            localStorage.removeItem('session:user')
            localStorage.removeItem('session:admin')
            
            // 3. Redireciona para a home
            router.push('/')
            router.refresh() // Atualiza os Server Components
        } catch (error) {
            console.error("Erro ao sair:", error)
        }
    }

    return (
        <Disclosure
            as="nav"
            className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-white/5"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    
                    {/* Mobile Menu Button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none">
                            <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                            <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                        </DisclosureButton>
                    </div>

                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        {/* Logo */}
                        <div className="flex shrink-0 items-center cursor-pointer" onClick={() => router.push(isAdmin ? '/admin' : '/store')}>
                            <img
                                alt="Atlética Shop"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                className="h-8 w-auto"
                            />
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden sm:ml-8 sm:block">
                            <div className="flex space-x-1">
                                {navigation.map((item) => {
                                    const isCurrent = pathname === item.href
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                isCurrent 
                                                    ? 'bg-indigo-500/10 text-indigo-400' 
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                                                'rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200'
                                            )}
                                        >
                                            {item.name}
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center gap-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        
                        {/* Cart Button with Notification Badge */}
                        {!isAdmin && (
                            <button
                                type="button"
                                onClick={onOpenCart}
                                className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <ShoppingBagIcon aria-hidden="true" className="size-6" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white ring-2 ring-gray-900">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Profile Dropdown */}
                        <Menu as="div" className="relative ml-3">
                            <MenuButton className="relative flex rounded-full ring-2 ring-white/5 focus:outline-none hover:ring-indigo-500/50 transition-all">
                                <Image
                                    alt="User Profile"
                                    src={minhaImagem}
                                    className="size-8 rounded-full bg-gray-800"
                                />
                            </MenuButton>

                            <MenuItems
                                transition
                                className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-2xl bg-gray-800 p-2 shadow-2xl border border-white/10 ring-1 ring-black ring-opacity-5 transition focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                            >
                                <div className="px-3 py-2 border-b border-white/5 mb-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sessão Ativa</p>
                                </div>
                                <MenuItem>
                                    <button
                                        onClick={handleLogOut}
                                        className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Sair da Conta
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>
            </div>

            {/* Mobile Panel */}
            <DisclosurePanel className="sm:hidden bg-gray-900/50 backdrop-blur-md">
                <div className="space-y-1 px-4 pt-2 pb-6">
                    {navigation.map((item) => {
                        const isCurrent = pathname === item.href
                        return (
                            <DisclosureButton
                                key={item.name}
                                as="a"
                                href={item.href}
                                className={classNames(
                                    isCurrent ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400',
                                    'block rounded-xl px-4 py-3 text-base font-bold'
                                )}
                            >
                                {item.name}
                            </DisclosureButton>
                        )
                    })}
                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}