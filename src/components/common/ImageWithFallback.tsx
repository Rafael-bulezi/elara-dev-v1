import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  /** Native img width attr — helps browser avoid layout shift */
  width?: number;
  /** Native img height attr */
  height?: number;
  /** object-fit style when used inside a fixed-size container */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

const ImageWithFallback = ({ src, alt, className, width, height, objectFit }: ImageWithFallbackProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 text-zinc-300 ${className}`}>
        <ImageIcon size={32} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Skeleton shown until image is loaded */}
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
        className={`w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit: objectFit ?? 'cover' }}
      />
    </div>
  );
};

export default ImageWithFallback;
