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
    const nameForm = formData.get('name') as string;
    const ageForm = formData.get('age') as string;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', nameForm)
      .eq('age', ageForm)
      .maybeSingle();

    if (error) {
      setAlertConfig({ show: true, title: 'Erro de Conexão', desc: 'Não foi possível consultar o banco, consulte o suporte!' });
      console.error(error);
      return;
    }

    if (data) {
      // Se encontrou o registro, os dados conferem
      router.push('/store');
    } else {
      // Se não encontrou, o e-mail ou a senha estão errados
      setAlertConfig({ 
        show: true, 
        title: 'Acesso Negado', 
        desc: 'E-mail e/ou senha incorretos. Verifique os dados e tente novamente!' 
      });
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