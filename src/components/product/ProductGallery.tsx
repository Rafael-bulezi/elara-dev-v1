import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

const ProductGallery = ({ images, title }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const safeImages = images.length > 0 ? images : ['https://picsum.photos/seed/placeholder/800/800'];

  const next = () => setActiveIndex((i) => (i + 1) % safeImages.length);
  const prev = () => setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative flex-1 min-h-[300px] bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden group">
        <ImageWithFallback
          src={safeImages[activeIndex]}
          alt={title}
          className="w-full h-full object-cover"
        />
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} className="text-zinc-700 dark:text-zinc-300" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} className="text-zinc-700 dark:text-zinc-300" />
            </button>
          </>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex ? 'border-purple-600' : 'border-transparent hover:border-zinc-300'
              }`}
            >
              <ImageWithFallback src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
