"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRole, type Role } from "./RoleContext";

interface PortalLinkProps {
  href: string;
  portal: Role;
  className?: string;
  children: ReactNode;
}

export function PortalLink({ href, portal, className, children }: PortalLinkProps) {
  const { setRole } = useRole();

  return (
    <Link href={href} className={className} onClick={() => setRole(portal)}>
      {children}
    </Link>
  );
}
