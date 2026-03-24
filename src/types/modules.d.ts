import type * as React from "react";

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
