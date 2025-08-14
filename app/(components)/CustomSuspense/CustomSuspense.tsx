import React, { ReactNode, Suspense } from "react";

interface CustomSuspenseProps {
  children: ReactNode;
  loadingText?: string;
  spinnerStyle?: "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  colorClass?: string; // e.g. 'text-primary', 'text-secondary'
}

const CustomSuspense: React.FC<CustomSuspenseProps> = ({
  children,
  loadingText = "Loading…",
  spinnerStyle = "spinner",
  size = "md",
  colorClass = "text-primary",
}) => {
  const loadingClass = `loading loading-${spinnerStyle} loading-${size} ${colorClass}`;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <span className={loadingClass} />
          <span className="text-base font-medium">{loadingText}</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default CustomSuspense;
