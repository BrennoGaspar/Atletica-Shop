interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName }: ConfirmDeleteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Card do Modal */}
      <div className="relative w-full max-w-md scale-100 rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Ícone de Alerta */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white">Excluir Produto?</h3>
          <p className="mt-2 text-sm text-gray-400">
            Tem certeza que deseja remover <span className="font-semibold text-white">"{itemName}"</span>? 
            Esta ação não poderá ser desfeita.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}