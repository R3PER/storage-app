// src/app/admin/components/common/Loading.tsx
/**
 * Loading Components
 * Provides various loading indicators and spinners.
 */
"use client";

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  center?: boolean;
  fullScreen?: boolean;
  className?: string;
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md',
  className = ''
}) => {
  return (
    <svg
      className={`animate-spin text-indigo-600 ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const LoadingSpinner: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  center = false,
  fullScreen = false,
  className = ''
}) => {
  const containerClasses = `
    flex items-center gap-3
    ${center ? 'justify-center' : ''}
    ${fullScreen ? 'fixed inset-0 bg-white bg-opacity-75' : ''}
    ${className}
  `;

  const content = (
    <div className={containerClasses}>
      <Spinner size={size} />
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-600`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export const LoadingDots: React.FC<LoadingProps> = ({
  size = 'md',
  className = ''
}) => {
  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const gapSize = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  return (
    <div className={`flex items-center ${gapSize[size]} ${className}`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`
            ${dotSize[size]}
            bg-indigo-600 rounded-full
            animate-[loading_1s_ease-in-out_infinite]
          `}
          style={{
            animationDelay: `${(i - 1) * 0.16}s`
          }}
        />
      ))}
    </div>
  );
};

export const LoadingBar: React.FC<LoadingProps & { progress?: number }> = ({
  progress,
  size = 'md',
  className = ''
}) => {
  const height = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div
      className={`
        w-full overflow-hidden
        bg-gray-200
        rounded-full
        ${height[size]}
        ${className}
      `}
    >
      <div
        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
        style={{
          width: progress ? `${progress}%` : '100%',
          animation: !progress ? 'indeterminate 1s ease-in-out infinite' : undefined
        }}
      />
    </div>
  );
};

export const LoadingSkeleton: React.FC<LoadingProps & { 
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}> = ({
  variant = 'text',
  width,
  height,
  className = ''
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
      style={style}
    />
  );
};

// Loading grid for dashboard cards
export const LoadingGrid: React.FC<LoadingProps & {
  items?: number;
  columns?: number;
}> = ({
  items = 4,
  columns = 2,
  className = ''
}) => {
  return (
    <div className={`
      grid gap-4
      grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}
      ${className}
    `}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
        >
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};
