'use client'

import CustomAlert from '@/components/customNotify';
import RegisterForm from '@/components/registerForm';
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useState } from 'react'

export default function SignUp() {
    const router = useRouter()
    const [alertConfig, setAlertConfig] = useState({ show: false, title: '', desc: '' });

    async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const nameForm = formData.get('name') as string;
        const ageForm = Number(formData.get('age'));
        const emailForm = formData.get('email') as string;
        const phoneFormRaw = formData.get('phone') as string;
        const passwordForm = formData.get('password') as string;

        const phoneForm = phoneFormRaw.replace(/\D/g, '');

        // Validação de senha
        const validatePassword = (password: string) => {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return regex.test(password);
            };

            // Dentro do seu handleSignUp:
            if (!validatePassword(passwordForm)) {
            setAlertConfig({
                show: true,
                title: 'Senha Fraca',
                desc: 'A senha deve ter 8+ caracteres, incluindo maiúsculas, números e símbolos (@$!%*?&).'
            });
            return;
        }

        // 1. Criar o usuário no Supabase Auth
        // O Trigger no SQL vai pegar esses metadados e salvar na tabela 'users' automaticamente
        const { data, error: authError } = await supabase.auth.signUp({
            email: emailForm,
            password: passwordForm,
            options: {
                data: {
                    full_name: nameForm,
                    age: ageForm,
                    phone: phoneForm
                }
            }
        });

        if (authError) {
            setAlertConfig({ 
                show: true, 
                title: 'Erro no Cadastro', 
                desc: authError.message 
            });
            return;
        }

        // 🚀 AQUI ESTÁ A MUDANÇA: 
        // Não fazemos mais o supabase.from('users').insert()
        // O Trigger no banco já fez isso!

        setAlertConfig({ 
            show: true, 
            title: 'Sucesso!', 
            desc: 'Conta criada! Verifique seu e-mail ou faça login.' 
        });
        
        setTimeout(() => router.push('/'), 2000);
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

            <RegisterForm
                title='Cadastre-se na A.A.A.A.C.H Store'
                buttonMessage='Finalizar Cadastro'
                onSubmitAction={handleSignUp}
            />
        </main>
    )
}