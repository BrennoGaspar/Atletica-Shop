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

        // Limpa qualquer caractere que não seja número antes de salvar
        const phoneForm = phoneFormRaw.replace(/\D/g, '');

        /**
         * 1. Criar o usuário no Supabase Auth
         * Passamos os dados extras no 'options.data' para ficarem salvos no metadata do usuário.
         */
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

        /**
         * 2. Salvar na tabela pública 'users'.
         * Agora usamos o ID real (UUID) gerado pelo Auth.
         */
        if (data.user) {
            const { error: dbError } = await supabase
                .from('users')
                .insert({ 
                    id: data.user.id, // O ID agora é o UUID do Auth
                    name: nameForm, 
                    email: emailForm, 
                    phone: phoneForm, 
                    age: ageForm 
                });

            if (dbError) {
                console.error('Erro ao sincronizar tabela pública:', dbError.message);
                // Note: O usuário já foi criado no Auth, o erro aqui é apenas na tabela extra.
            }

            setAlertConfig({ 
                show: true, 
                title: 'Sucesso!', 
                desc: 'Verifique seu e-mail para confirmar o cadastro (se habilitado) ou faça login.' 
            });
            
            // Redireciona após um breve delay
            setTimeout(() => router.push('/'), 2000);
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

            <RegisterForm
                title='Cadastre sua conta na Atlética'
                buttonMessage='Finalizar Cadastro'
                onSubmitAction={handleSignUp}
            />
        </main>
    )
}