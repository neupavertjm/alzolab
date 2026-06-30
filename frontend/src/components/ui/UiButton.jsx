import React from "react";
import { Loader2 } from "lucide-react";

// Botón base del sistema de diseño. Naranja = acción principal (color de marca).
export default function UiButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-paper dark:focus:ring-offset-navy-950 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variants = {
    primary: "bg-orange text-white hover:bg-orange-dark focus:ring-orange shadow-cta",
    secondary:
      "bg-navy text-white hover:bg-navy-700 focus:ring-navy dark:bg-navy-700 dark:hover:bg-navy",
    outline:
      "border border-line bg-white text-navy hover:bg-paper focus:ring-orange dark:bg-navy-900 dark:text-slate-100 dark:border-white/10 dark:hover:bg-navy-800",
    ghost:
      "bg-transparent text-slate-500 hover:bg-paper-100 hover:text-navy dark:text-slate-300 dark:hover:bg-white/5",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && leftIcon}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
