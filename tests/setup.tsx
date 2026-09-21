import "@testing-library/jest-dom";

import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    priority,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
  }) {
    return <img src={src} alt={alt} {...rest} />;
  },
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: function MockLink({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));
