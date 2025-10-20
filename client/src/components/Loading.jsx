import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
  );
};




export default LoadingSpinner;