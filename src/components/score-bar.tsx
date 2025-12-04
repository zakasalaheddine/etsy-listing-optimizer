export default function ScoreBar({ score }: { score: number }) {
  const percentage = score;
  let bgGradient = "from-red-500 to-red-600";

  if (percentage >= 85) {
    bgGradient = "from-teal-500 to-teal-600";
  } else if (percentage >= 65) {
    bgGradient = "from-yellow-500 to-yellow-600";
  }

  return (
    <div
      className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden shadow-inner"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Quality score: ${score} out of 100`}
    >
      <div
        className={`bg-gradient-to-r ${bgGradient} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
        title={`Score: ${score}/100`}
      />
    </div>
  );
}
