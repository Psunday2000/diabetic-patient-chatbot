"use client";

import React, { useEffect, useState } from 'react';

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: number;
  alt?: string;
  className?: string;
};

export default function Avatar({ src, name, size = 40, alt = 'avatar', className = '' }: AvatarProps) {
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    try { setKey(Number(localStorage.getItem('avatarKey')) || 0); } catch { setKey(0); }
    function onStorage(e: StorageEvent) {
      if (e.key === 'avatarKey') setKey(Number(e.newValue || 0));
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const initials = (() => {
    const display = name || '';
    const parts = display.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  const url = src ? src + (key ? `?v=${key}` : '') : null;

  if (!url) {
    return (
      <div className={`${className} rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground w-full h-full`}>{initials || null}</div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={`${className} rounded-full object-cover w-full h-full block`} />
  );
}
