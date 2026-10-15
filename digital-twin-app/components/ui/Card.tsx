import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  accent,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
  [key: string]: unknown;
}) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-line border-b-[3px] bg-card shadow-xs transition duration-150 hover:border-cyan/50 max-w-full relative overflow-visible ${className}`}
      style={accent ? { borderLeft: `3.5px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  caption,
  right,
}: {
  title: ReactNode;
  caption?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 px-5 py-4 sm:px-6 sm:py-4.5">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-text truncate">{title}</h3>
        {caption && (
          <p className="mt-0.5 text-xs leading-normal text-text/50 font-medium truncate">{caption}</p>
        )}
      </div>
      {right}
    </div>
  );
}
