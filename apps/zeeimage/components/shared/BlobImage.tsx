'use client';

import { useEffect, useRef } from 'react';

type BlobImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  blob: Blob;
  alt: string;
};

/**
 * An <img> of a local blob or file. The object URL is created and revoked inside one effect and written
 * straight to the element, so it survives Strict Mode's remount and never leaks on re-render.
 */
export default function BlobImage({ blob, alt, ...rest }: BlobImageProps) {
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
    // eslint-disable-next-line @next/next/no-img-element -- blob: of a local file; next/image cannot optimise it in a static export
    <img ref={imgRef} alt={alt} decoding="async" {...rest} />
  );
}
