export function LoadingSpinner({ text = 'Yükleniyor...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-11 h-11 rounded-full border-3 border-cyan/20 border-t-cyan animate-spin" />
      <p className="mt-4 text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export function ErrorMessage({ message = 'Bir hata oluştu.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <i className="fa fa-circle-exclamation text-4xl text-red-500 mb-3" />
      <p className="text-red-500 text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'Henüz içerik bulunmuyor.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <i className="fa fa-inbox text-4xl text-gray-300 mb-3" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
