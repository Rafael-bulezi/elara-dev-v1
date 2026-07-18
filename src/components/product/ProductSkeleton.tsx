import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse flex flex-col h-full">
      <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-zinc-800" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        </div>
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-3" />
        <div className="mt-auto">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mb-4" />
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;

