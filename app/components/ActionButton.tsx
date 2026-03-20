import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
  icon?: ReactNode;
}

const variants = {
  primary:
    "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
  secondary:
    "bg-secondary border border-border hover:border-primary/30 text-secondary-foreground",
  danger:
    "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20",
  ghost:
    "bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground",
};

const sizes = {
  sm: "px-3 py-1.5 text-[13px] gap-1.5",
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
