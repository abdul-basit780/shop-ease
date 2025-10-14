
export const Loading = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const LoadingSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 animate-pulse`}></div>
      <div className={`${sizeClasses[size]} rounded-full border-4 border-t-primary-600 border-r-secondary-600 border-b-transparent border-l-transparent animate-spin absolute top-0 left-0`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <LoadingSpinner />
        {text && <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>}
      </div>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 skeleton"></div>
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded-lg mb-3 skeleton"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-3 skeleton"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-4 skeleton"></div>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded-lg w-24 skeleton"></div>
          <div className="h-9 bg-gray-200 rounded-lg w-20 skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};