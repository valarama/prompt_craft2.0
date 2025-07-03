import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDuration = 5000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade out animation
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  if (!isVisible) {
    return null;
  }

  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-300',
          iconColor: 'text-red-400',
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-300',
          iconColor: 'text-green-400',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-300',
          iconColor: 'text-yellow-400',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-300',
          iconColor: 'text-blue-400',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg p-4 backdrop-blur-sm transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-white mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>

        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast notification system
interface ToastNotification {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => onRemove(notification.id)}
          autoClose={true}
          autoCloseDuration={notification.duration || 5000}
          className="shadow-lg"
        />
      ))}
    </div>
  );
};

export default Alert;
