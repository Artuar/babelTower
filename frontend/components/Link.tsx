import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React from "react";

interface LinkProps extends NextLinkProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
  target?: string;
}

export const Link: React.FC<LinkProps> = (props) => {
  const { style, children, ...rest } = props;

  return (
    <NextLink {...rest}
        style={{
          color: "inherit",
          textDecoration: "none",
          ...style,
        }}
      >
        {children}
    </NextLink>
  );
};
