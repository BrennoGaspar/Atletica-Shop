"use client"

interface Props {
    title: string
    buttonMessage: string
    button: boolean
    onSubmitAction: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function LoginForm({ title, buttonMessage, button, onSubmitAction }: Props) {

    return (

        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">

            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" className="mx-auto h-10 w-auto" />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">{title}</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={onSubmitAction} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Nome</label>
                        <div className="mt-2">
                            <input id="email" type="text" name="name" required autoComplete="email" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Idade</label>
                            {/* <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">Esqueceu a senha?</a>
                                </div> */}
                        </div>
                        <div className="mt-2">
                            <input id="password" type="text" name="age" required autoComplete="current-password" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">{buttonMessage}</button>
                    </div>
                </form>

                {button &&
                    <p className="mt-10 text-center text-sm/6 text-gray-400">
                    Ainda não tem registro?
                        <a href="/singup" className="font-semibold text-indigo-400 hover:text-indigo-300"> Cadastre-se</a>
                    </p>
                }
            </div>
        </div>

    )
}