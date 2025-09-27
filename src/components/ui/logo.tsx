"use client";

import React from 'react';
// Logo renders a simple <img>. Do not wrap with a Link here to avoid nested anchors.

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  href?: string;
  alt?: string;
  size?: number;
};

export default function Logo({ alt = 'App logo', size = 32, className = '', ...rest }: LogoProps) {
  return (
    <img
      src="/favicon.ico"
      alt={alt}
      width={size}
      height={size}
      className={className}
      {...rest}
    />
  );
}
