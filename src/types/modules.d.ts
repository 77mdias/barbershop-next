import type * as React from "react";

declare module "lucide-react" {
  export const Star: React.ComponentType<any>;
  export const MapPin: React.ComponentType<any>;
  export const Clock: React.ComponentType<any>;
  export const Phone: React.ComponentType<any>;
  export const Mail: React.ComponentType<any>;
  export const Calendar: React.ComponentType<any>;
  export const User: React.ComponentType<any>;
  export const LogOut: React.ComponentType<any>;
  export const Menu: React.ComponentType<any>;
  export const X: React.ComponentType<any>;
  export const Heart: React.ComponentType<any>;
  export const Check: React.ComponentType<any>;
  export const AlertCircle: React.ComponentType<any>;
  export const Info: React.ComponentType<any>;
  export const ChevronDown: React.ComponentType<any>;
  export const ChevronLeft: React.ComponentType<any>;
  export const ChevronRight: React.ComponentType<any>;
  export const Search: React.ComponentType<any>;
  export const Plus: React.ComponentType<any>;
  export const Minus: React.ComponentType<any>;
  export const Edit: React.ComponentType<any>;
  export const Trash: React.ComponentType<any>;
  export const Save: React.ComponentType<any>;
  export const Upload: React.ComponentType<any>;
  export const Download: React.ComponentType<any>;
  export const Settings: React.ComponentType<any>;
  export const Home: React.ComponentType<any>;
  export const ShoppingBag: React.ComponentType<any>;
  export const CreditCard: React.ComponentType<any>;
  export const Gift: React.ComponentType<any>;
  export const Badge: React.ComponentType<any>;
  export const Scissors: React.ComponentType<any>;
  export const Zap: React.ComponentType<any>;
  export const Crown: React.ComponentType<any>;
  export const Sparkles: React.ComponentType<any>;
  export const TrendingUp: React.ComponentType<any>;
  export const BarChart: React.ComponentType<any>;
  export const PieChart: React.ComponentType<any>;
  export const Users: React.ComponentType<any>;
  export const UserPlus: React.ComponentType<any>;
  export const Filter: React.ComponentType<any>;
  export const SortAsc: React.ComponentType<any>;
  export const SortDesc: React.ComponentType<any>;
  export const RefreshCw: React.ComponentType<any>;
  export const Bell: React.ComponentType<any>;
  export const BellOff: React.ComponentType<any>;
  export const Eye: React.ComponentType<any>;
  export const EyeOff: React.ComponentType<any>;
  export const Lock: React.ComponentType<any>;
  export const Unlock: React.ComponentType<any>;
  export const Key: React.ComponentType<any>;
  export const Shield: React.ComponentType<any>;
  export const ShieldCheck: React.ComponentType<any>;
  export const AlertTriangle: React.ComponentType<any>;
  export const CheckCircle: React.ComponentType<any>;
  export const XCircle: React.ComponentType<any>;
  export const Loader: React.ComponentType<any>;
  export const Loader2: React.ComponentType<any>;
  export const Spinner: React.ComponentType<any>;
  export const Copy: React.ComponentType<any>;
  export const Share: React.ComponentType<any>;
  export const ExternalLink: React.ComponentType<any>;
  export const ArrowLeft: React.ComponentType<any>;
  export const ArrowRight: React.ComponentType<any>;
  export const ArrowUp: React.ComponentType<any>;
  export const ArrowDown: React.ComponentType<any>;
  export const MoreHorizontal: React.ComponentType<any>;
  export const MoreVertical: React.ComponentType<any>;
}

declare module "next/link" {
  import { ComponentType, AnchorHTMLAttributes } from "react";
  interface LinkProps
    extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
  }
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module "next/image" {
  import { ComponentType, ImgHTMLAttributes } from "react";
  interface ImageProps
    extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
    src: string;
    width?: number;
    height?: number;
    layout?: "fill" | "fixed" | "intrinsic" | "responsive";
    priority?: boolean;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    unoptimized?: boolean;
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    objectPosition?: string;
    quality?: number;
    sizes?: string;
  }
  const Image: ComponentType<ImageProps>;
  export default Image;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: object;
    }
    interface ElementChildrenAttribute {
      children: object;
    }
  }
}

export {};
