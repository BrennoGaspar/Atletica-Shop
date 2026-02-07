'use client' // Como é um teste simples de botão, usamos Client Component

import LoginForm from '@/components/loginForm'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      
      <LoginForm/>

    </main>
  )

}