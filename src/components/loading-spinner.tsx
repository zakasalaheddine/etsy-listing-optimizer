interface LoadingSpinnerProps {
  message: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
      <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}
