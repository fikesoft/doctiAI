import React from "react";

const HeaderSkeleton = () => {
  return (
    <header className="bg-base-100 shadow-md sticky top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center h-16">
          {/* Left: logo skeleton */}
          <div className="skeleton h-10 w-20 bg-secondary mx-2"></div>

          {/* Center: nav skeleton */}
          <div className="hidden md:flex flex-1 justify-center gap-6">
            <div className="skeleton h-6 w-16 bg-secondary"></div>
            <div className="skeleton h-6 w-16 bg-secondary"></div>
            <div className="skeleton h-6 w-16 bg-secondary"></div>
          </div>

          {/* Right: actions skeleton */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            <div className="skeleton h-8 w-8 rounded-full bg-secondary"></div>
            <div className="skeleton h-8 w-20 bg-secondary rounded"></div>
          </div>

          {/* Mobile toggle skeleton */}
          <div className="md:hidden ml-auto">
            <div className="skeleton h-8 w-8 rounded bg-secondary"></div>
          </div>
        </div>

        {/* mobile menu panel skeleton */}
        <div className="md:hidden flex flex-col space-y-2 pb-4">
          <div className="skeleton h-6 w-full bg-secondary"></div>
          <div className="skeleton h-6 w-full bg-secondary"></div>
          <div className="skeleton h-6 w-full bg-secondary"></div>
          <div className="flex justify-center space-x-4 pt-2">
            <div className="skeleton h-8 w-8 rounded-full bg-secondary"></div>
            <div className="skeleton h-8 w-20 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSkeleton;
