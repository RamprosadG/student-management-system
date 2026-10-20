export type PortalKind = "staff" | "student";

export interface PortalNavLink {
  href: string;
  title: string;
  description: string;
  number: string;
}

export interface PortalSectionProps {
  title: string;
  subtitle: string;
  badge: string;
  portal: PortalKind;
  links: PortalNavLink[];
}
