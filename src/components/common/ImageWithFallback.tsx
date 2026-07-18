import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
}

const ImageWithFallback = ({ src, alt, className }: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 ${className}`}>
        <ImageIcon size={48} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

export default ImageWithFallback;

