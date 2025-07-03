import React from 'react';
import { Loader2, Brain, Sparkles } from 'lucide-react';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'brain';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  variant = 'spinner', 
  size = 'md', 
  message,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
    }
  };

  const renderSpinner = () => (
    <Loader2 className={`${getSizeClasses()} animate-spin text-purple-400`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} 
                     bg-purple-400 rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${getSizeClasses()} bg-purple-400 rounded-full animate-pulse`} />
  );

  const renderBrain = () => (
    <div className="relative">
      <Brain className={`${getSizeClasses()} text-purple-400 animate-pulse`} />
      <Sparkles className={`${getSizeClasses()} text-pink-400 absolute -top-1 -right-1 animate-ping`} 
                style={{ width: '60%', height: '60%' }} />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'brain':
        return renderBrain();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoader()}
      {message && (
        <p className={`${getTextSize()} text-slate-300 text-center animate-fade-in`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Full-screen loading overlay
interface LoadingOverlayProps extends LoadingProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  ...loadingProps 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 backdrop-blur-sm">
        <Loading {...loadingProps} size="lg" />
      </div>
    </div>
  );
};

// Skeleton loading for cards
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`prompt-card animate-pulse ${className}`}>
    <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-slate-700 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
  </div>
);

// Button loading state
export const ButtonLoading: React.FC<{ 
  isLoading: boolean; 
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    {isLoading && <Loading variant="spinner" size="sm" />}
    {children}
  </div>
);

export default Loading;
