'use client';

import { useEffect, useRef } from 'react';

interface ResultThumbProps {
  blob: Blob;
  alt: string;
}

/**
 * Preview of a processed blob. The object URL is created and revoked inside an
 * effect (and written straight to the element) so it never leaks on re-render.
 */
export default function ResultThumb({ blob, alt }: ResultThumbProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const url = URL.createObjectURL(blob);
    img.src = url;
    return () => {
      img.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob: preview of a locally processed file; next/image cannot optimise it in a static export
    <img
      ref={imgRef}
      alt={alt}
      width={40}
      height={40}
      decoding="async"
      className="size-full object-cover"
    />
  );
}
