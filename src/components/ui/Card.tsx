import clsx from "clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-card border border-line bg-surface p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
