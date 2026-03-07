'use client'

import { createBrowserClient } from '@supabase/ssr' // ✅ IMPORTANTE: Use o SSR
import CustomAlert from '@/components/customNotify';
import LoginForm from '@/components/loginForm'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', desc: '' });

  // Inicializa o cliente que entende cookies do Next.js
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // useEffect(() => {
  //   async function checkActiveSession() {
  //     const { data: { session } } = await supabase.auth.getSession();
      
  //     if (session) {
  //       // 💡 Evite redirecionar se já estivermos no processo de transição
  //       const { data: profile } = await supabase
  //         .from('users')
  //         .select('adm')
  //         .eq('id', session.user.id)
  //         .single();

  //       if (profile?.adm) {
  //         router.replace('/admin'); // Use replace para não sujar o histórico
  //       } else {
  //         router.replace('/store');
  //       }
  //     }
  //   }
  //   checkActiveSession();
  // }, [router, supabase]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const emailForm = formData.get('email') as string;
    const passwordForm = formData.get('password') as string;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailForm,
      password: passwordForm,
    });

    if (error) {
      setAlertConfig({ 
        show: true, 
        title: 'Acesso Negado', 
        desc: 'E-mail ou senha incorretos.' 
      });
      return;
    }

    if (data?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('adm')
        .eq('id', data.user.id)
        .single();

      const targetPath = profile?.adm ? '/admin' : '/store';

      router.replace(targetPath);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-950">
      {alertConfig.show && (
        <CustomAlert 
          title={alertConfig.title} 
          description={alertConfig.desc} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}

      <div className="w-full max-w-md">
        <LoginForm
          title='Acesse sua conta A.A.A.A.C.H Store'
          button={true}
          buttonMessage='Entrar'
          onSubmitAction={handleLogin}
        />
      </div>
    </main>
  )
}