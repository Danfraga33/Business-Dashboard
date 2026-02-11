import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
  icon?: ReactNode;
}

const variants = {
  primary:
    "bg-accent hover:bg-accent-hover text-white shadow-sm shadow-accent/20",
  secondary:
    "bg-surface border border-edge hover:border-accent/40 text-ink",
  danger:
    "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20",
  ghost:
    "bg-transparent hover:bg-surface-hover text-ink-secondary hover:text-ink",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
};

export function ActionButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
