import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`border-4 border-blue-600 border-t-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}></div>
  );
};

const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const LoadingButton = ({ loading, children, disabled, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${props.className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

const LoadingCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

const LoadingTable = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-6 border-b animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingPage, LoadingButton, LoadingCard, LoadingTable };
export default LoadingSpinner;