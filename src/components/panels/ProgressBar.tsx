export function ProgressBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-16 shrink-0 text-slate-500 dark:text-slate-400">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-semibold text-slate-600 dark:text-slate-300">
        {Math.round(value)}%
      </span>
    </div>
  );
}
