
import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="w-full animate-pulse select-none">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-200">
        {/* Dock Skeleton */}
        <div className="absolute bottom-3 inset-x-2 sm:inset-x-4 h-10 sm:h-12 bg-gray-300/50 rounded-lg" />
      </div>

      {/* Text Info Skeleton */}
      <div className="mt-3 px-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
};

export default ProductSkeleton;