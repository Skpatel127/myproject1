import clsx from "clsx";

const TONE_CLASSES: Record<string, string> = {
  healthy: "bg-status-healthy/10 text-status-healthy",
  attention: "bg-status-attention/10 text-status-attention",
  risk: "bg-status-risk/10 text-status-risk",
  info: "bg-status-info/10 text-status-info",
  neutral: "bg-line text-muted",
  brand: "bg-brand-light text-brand-dark",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
