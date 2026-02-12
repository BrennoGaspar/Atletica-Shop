'use client' // Como é um teste simples de botão, usamos Client Component

import CustomAlert from '@/components/customNotify';
import RegisterForm from '@/components/registerForm';
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation';
import { useState } from 'react'

export default function SignUp() {

    const router = useRouter()

    const [alertConfig, setAlertConfig] = useState({ show: false, title: '', desc: '' });

    async function handleSingUp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); // don't reload the page

        const formData = new FormData(event.currentTarget);
        const nameForm = formData.get('name') as string;
        const ageForm = Number(formData.get('age'));
        const emailForm = formData.get('email') as string;
        const phoneForm = formData.get('phone') as string;
        const passwordForm = formData.get('password') as string;

        const { error } = await supabase
            .from('users')
            .insert({ name: nameForm, email: emailForm, password: passwordForm, phone: phoneForm, age: ageForm })

        if (!error) {
            router.push('/')
        } else {
            setAlertConfig({ show: true, title: 'Cadastro Inválido', desc: 'Não foi possível realizar o cadastro, tente novamente!' });
            console.log('ERRO: ', error)
        }

    }

    return (

        < main className="flex min-h-screen flex-col items-center justify-center p-24" >

            {
                alertConfig.show && (
                    <CustomAlert
                        title={alertConfig.title}
                        description={alertConfig.desc}
                        onClose={() => setAlertConfig({ ...alertConfig, show: false })}
                    />
                )
            }

            < RegisterForm
                title='Cadastre sua conta virtual'
                buttonMessage='Cadastrar'
                onSubmitAction={handleSingUp}
            />

        </main >
    )

}