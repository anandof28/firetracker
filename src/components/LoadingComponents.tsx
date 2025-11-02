import React from 'react';

// Type definitions
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'blue' | 'purple' | 'green' | 'red' | 'gray';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
}

interface AILoadingOrbProps {
  size?: SpinnerSize;
}

// Base Loading Spinner Component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses: Record<SpinnerColor, string> = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div className="relative">
      <div className={`animate-spin rounded-full border-4 border-gray-200 ${sizeClasses[size]}`}></div>
      <div className={`animate-spin rounded-full border-4 ${colorClasses[color]} border-t-transparent absolute top-0 left-0 ${sizeClasses[size]}`}></div>
    </div>
  );
};

// AI-style Pulsing Orb
export const AILoadingOrb: React.FC<AILoadingOrbProps> = ({ size = 'lg' }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse-glow`}></div>
      <div className={`absolute ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-75`}></div>
      <div className={`absolute ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-300 to-purple-400 animate-ping opacity-50 animation-delay-200`}></div>
    </div>
  );
};

// Neural Network Loading Animation
export const NeuralNetworkLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-2">
          <div className={`w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce`} 
               style={{ animationDelay: `${i * 0.1}s` }}></div>
          <div className={`w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded animate-pulse`}
               style={{ animationDelay: `${i * 0.1}s` }}></div>
          <div className={`w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-bounce`}
               style={{ animationDelay: `${i * 0.1 + 0.5}s` }}></div>
        </div>
      ))}
    </div>
  );
};

// Skeleton Components
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-3">
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

interface SkeletonListProps {
  items?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ items = 5 }) => (
  <div className="space-y-4">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 shadow border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface LoaderProps {
  message?: string;
}

// Full Page Loading Component
export const PageLoader: React.FC<LoaderProps> = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <AILoadingOrb size="xl" />
      <div className="mt-6 space-y-2">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {message}
        </h3>
        <NeuralNetworkLoader />
        <p className="text-gray-600 text-sm animate-pulse">Powered by AI Intelligence</p>
      </div>
    </div>
  </div>
);

// Modal Loading Overlay
export const ModalLoader: React.FC<LoaderProps> = ({ message = "Processing..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-blue-900/30 to-black/20 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
      <AILoadingOrb size="lg" />
      <div className="mt-4 space-y-2">
        <h4 className="text-lg font-semibold text-gray-800">{message}</h4>
        <div className="flex justify-center">
          <NeuralNetworkLoader />
        </div>
        <p className="text-sm text-gray-600">Please wait a moment...</p>
      </div>
    </div>
  </div>
);

// Smart Loading States for Different Data Types
export const LoadingStates: Record<string, React.FC> = {
  Dashboard: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-80 mb-2 animate-pulse"></div>
          <div className="h-5 bg-slate-200 rounded w-64 animate-pulse"></div>
        </div>

        {/* Net Worth Card Skeleton */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-50 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 opacity-50 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-40 mb-3 animate-pulse"></div>
                <div className="h-16 bg-gradient-to-r from-slate-200 to-blue-200 rounded-lg w-64 mb-2 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl animate-pulse"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { from: 'from-blue-100', to: 'to-blue-200' },
                { from: 'from-red-100', to: 'to-red-200' },
                { from: 'from-green-100', to: 'to-green-200' },
                { from: 'from-orange-100', to: 'to-orange-200' }
              ].map((colors, i) => (
                <div key={i} className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl p-4 border border-slate-200 animate-pulse`}>
                  <div className="h-3 bg-white/60 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-white/80 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { from: 'from-green-100', to: 'to-emerald-200' },
            { from: 'from-blue-100', to: 'to-blue-200' },
            { from: 'from-amber-100', to: 'to-yellow-200' },
            { from: 'from-red-100', to: 'to-rose-200' }
          ].map((colors, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl animate-pulse`}></div>
                <div className="h-8 bg-slate-200 rounded w-12 animate-pulse"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-7 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Monthly Overview Skeleton */}
        <div className="mb-8 bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-7 bg-slate-200 rounded w-56 mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-5 bg-blue-200 rounded w-28 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { from: 'from-green-100', to: 'to-emerald-200' },
              { from: 'from-red-100', to: 'to-rose-200' },
              { from: 'from-blue-100', to: 'to-indigo-200' }
            ].map((colors, i) => (
              <div key={i} className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-2xl p-6 border-2 border-slate-200 animate-pulse`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/50 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/60 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-white/80 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-3 bg-white/50 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Centered Loading Animation */}
        <div className="flex flex-col items-center justify-center py-12">
          <AILoadingOrb size="xl" />
          <div className="mt-6 text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-pulse">
              Loading Your Financial Dashboard
            </h3>
            <NeuralNetworkLoader />
            <p className="text-slate-600 text-sm mt-3">Fetching your accounts, transactions, and investments...</p>
          </div>
        </div>
      </div>
    </div>
  ),

  Loans: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8 animate-pulse">
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-80"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-32"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        <SkeletonList items={3} />
      </div>
    </div>
  ),

  EMIs: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="p-6">
            <SkeletonList items={4} />
          </div>
        </div>
      </div>
    </div>
  )
};