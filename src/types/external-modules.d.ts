// Declarações de módulos para resolver imports
declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  export interface LucideProps
    extends Partial<Omit<SVGProps<SVGSVGElement>, "ref">> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    strokeWidth?: string | number;
  }
  export type Icon = FC<LucideProps>;
  export const Star: Icon;
  export const MapPin: Icon;
  export const Clock: Icon;
  export const Phone: Icon;
  export const Mail: Icon;
  export const Calendar: Icon;
  export const User: Icon;
  export const LogOut: Icon;
  export const Menu: Icon;
  export const X: Icon;
  export const Heart: Icon;
  export const Check: Icon;
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const ChevronDown: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Search: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const Edit: Icon;
  export const Trash: Icon;
  export const Save: Icon;
  export const Upload: Icon;
  export const Download: Icon;
  export const Settings: Icon;
  export const Home: Icon;
  export const ShoppingBag: Icon;
  export const CreditCard: Icon;
  export const Gift: Icon;
  export const Badge: Icon;
  export const Scissors: Icon;
  export const Zap: Icon;
  export const Crown: Icon;
  export const Sparkles: Icon;
  export const TrendingUp: Icon;
  export const BarChart: Icon;
  export const PieChart: Icon;
  export const Users: Icon;
  export const UserPlus: Icon;
  export const Filter: Icon;
  export const SortAsc: Icon;
  export const SortDesc: Icon;
  export const RefreshCw: Icon;
  export const Bell: Icon;
  export const BellOff: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Lock: Icon;
  export const Unlock: Icon;
  export const Key: Icon;
  export const Shield: Icon;
  export const ShieldCheck: Icon;
  export const AlertTriangle: Icon;
  export const CheckCircle: Icon;
  export const XCircle: Icon;
  export const Loader: Icon;
  export const Loader2: Icon;
  export const Spinner: Icon;
  export const Copy: Icon;
  export const Share: Icon;
  export const ExternalLink: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const ArrowUp: Icon;
  export const ArrowDown: Icon;
  export const MoreHorizontal: Icon;
  export const MoreVertical: Icon;
}

declare module "next/link" {
  import { ComponentType, AnchorHTMLAttributes, ReactNode } from "react";

  export interface LinkProps
    extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    children?: ReactNode;
  }

  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module "next/image" {
  import { ComponentType, ImgHTMLAttributes } from "react";

  export interface ImageProps
    extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    sizes?: string;
    quality?: number;
    priority?: boolean;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoad?: () => void;
    onError?: () => void;
  }

  const Image: ComponentType<ImageProps>;
  export default Image;
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (href: string) => void;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function redirect(url: string): never;
  export function notFound(): never;
}
