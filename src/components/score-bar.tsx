export default function ScoreBar({ score }: { score: number }) {
  const percentage = score;
  let bgColor = "bg-red-500";
  if (percentage > 85) bgColor = "bg-teal-500";
  else if (percentage > 65) bgColor = "bg-yellow-500";

  return (
    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 my-1">
      <div
        className={`${bgColor} h-2 rounded-full`}
        style={{ width: `${percentage}%` }}
        title={`Score: ${score}/100`}
      ></div>
    </div>
  );
}
