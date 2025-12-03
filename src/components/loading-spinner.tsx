interface LoadingSpinnerProps {
  message: string;
  step?: number; // Current step (1-3)
  totalSteps?: number; // Total steps (default 3)
}

export default function LoadingSpinner({
  message,
  step = 1,
  totalSteps = 3,
}: LoadingSpinnerProps) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
      {/* Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
        <div
          className="absolute top-0 left-0 w-16 h-16 border-4 border-t-4 border-transparent border-t-teal-500 rounded-full animate-spin"
          style={{
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>

      {/* Progress bar */}
      <div className="w-64 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Message */}
      <div className="text-center space-y-1">
        <p className="text-slate-800 dark:text-slate-200 font-medium">
          {message}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Step {step} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
