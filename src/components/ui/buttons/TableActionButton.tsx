"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";


interface TableActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  children: ReactNode;
  isLoading?: boolean;
}

export function TableActionButton({
  tooltip,
  children,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: TableActionButtonProps) {
  return (
    <div className="relative inline-block group">
      <button
        type="button"
        className={`cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        title={tooltip}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    </div>
  );
}

interface TableActionLinkProps {
  href: string;
  tooltip: string;
  children: ReactNode;
  className?: string;
}

export function TableActionLink({
  href,
  tooltip,
  children,
  className = "",
}: TableActionLinkProps) {
  return (
    <div className="relative inline-flex group">
      <Link
        href={href}
        className={`disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        aria-label={tooltip}
        title={tooltip}
      >
        {children}
      </Link>
    </div>
  );
}
