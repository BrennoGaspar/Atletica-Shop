'use client'

import { useEffect } from 'react'

interface AlertProps {
  title: string
  description: string
  open: boolean
  setOpen: (open: boolean) => void
  sucessType: boolean
}

export default function CustomAlertTimer({ title, description, open, setOpen, sucessType }: AlertProps) {
  
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 3000);

      return () => clearTimeout(timer)
    }
  }, [open, setOpen]);

  if (!open) return null;

  // Definimos as variações de cor e ícone dinamicamente
  const config = {
    color: sucessType ? 'green' : 'red',
    borderColor: sucessType ? 'border-green-500' : 'border-red-500',
    progressColor: sucessType ? 'bg-green-500' : 'bg-red-500',
    textColor: sucessType ? 'text-green-500' : 'text-red-500',
    icon: sucessType ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    )
  }

  return (
    <div 
      role="alert"
      className="fixed top-20 right-5 z-[100] w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className={`relative rounded-lg bg-gray-900 border-l-4 ${config.borderColor} p-4 shadow-2xl shadow-black/50`}>
        <div className="flex items-center gap-3">
          
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.textColor}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              {config.icon}
            </svg>
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-white uppercase tracking-wider">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="absolute bottom-2 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.progressColor} rounded-full animate-shrink`} 
            style={{ animationDuration: '3000ms' }}
          />
        </div>
      </div>
    </div>
  )
}