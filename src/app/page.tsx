'use client' // Como é um teste simples de botão, usamos Client Component

import CustomAlert from '@/components/customAlert';
import LoginForm from '@/components/loginForm'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function Home() {

  const router = useRouter()
  
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', desc: '' });

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // evita recarregar a página e perder dados

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const age = Number(formData.get('age'));

    const { data, error } = await supabase
      .from('users')
      .select('age')
      .eq('name', name);

    if (data && data.length > 0) {
      if (data[0].age == age) {
        router.push('/store')
      } else {
          setAlertConfig({ show: true, title: 'Idade Incorreta', desc: 'A idade está incorreta, tente novamente!' });
      }
    } else {
        setAlertConfig({ show: true, title: 'Usuário não encontrado', desc: 'O usuário não foi encontrado em nosso sistema, tente novamente!' });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">

      {alertConfig.show && (
        <CustomAlert 
          title={alertConfig.title} 
          description={alertConfig.desc} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}

      <LoginForm
        title='Acesse sua conta virtual'
        button={true}
        buttonMessage='Entrar'
        onSubmitAction={handleLogin}
      />

    </main>
  )

}