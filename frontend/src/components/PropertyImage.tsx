import { useState } from 'react';

const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23e2e8f0'/><g stroke='%2394a3b8' stroke-width='10' fill='none' stroke-linecap='round' stroke-linejoin='round'><path d='M200 85L110 150h45v75h90v-75h45z'/><path d='M155 200v-40h30v40'/><path d='M245 200v-25h-30v25'/></g></svg>";

interface PropertyImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function PropertyImage({ src, alt = '', className }: PropertyImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed || !src ? PLACEHOLDER : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
