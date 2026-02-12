'use client'

import CustomAlert from '@/components/customNotify';
import LoginForm from '@/components/loginForm'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function Home() {

  const router = useRouter()
  
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', desc: '' });

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // don't reload the page

    const formData = new FormData(event.currentTarget);
    const emailForm = formData.get('email') as string;
    const passwordForm = formData.get('password') as string;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailForm)
      .eq('password', passwordForm)

    if (error) {
      setAlertConfig({ show: true, title: 'Erro de Conexão', desc: 'Não foi possível consultar o banco, consulte o suporte!' });
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      if( data[0].adm == false ){
        localStorage.setItem('session:user', JSON.stringify(data))
        router.push('/store')
      } else {
        localStorage.setItem('session:admin', JSON.stringify(data))
        router.push('/admin')
      }
    } else {
      setAlertConfig({ 
        show: true, 
        title: 'Acesso Negado', 
        desc: 'E-mail e/ou senha incorretos. Verifique os dados e tente novamente!' 
      });
    }
  }

  useEffect(() => {
    const session = localStorage.getItem('session:user');
    
    if (!session) {
      // if not have session, return to LoginPage
      router.push('/');
    }
  }, [router]);

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