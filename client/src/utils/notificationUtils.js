import { toast } from 'react-hot-toast';

/**
 * Show a simple notification toast without JSX
 */
export const showNotificationToast = (notification, options = {}) => {
  const { duration = 5000 } = options;

  // Create a simple text-based toast
  const message = `${notification.icon || '🔔'} ${notification.title}: ${notification.message}`;
  
  toast.success(message, {
    duration,
    position: 'top-right',
    style: {
      background: 'var(--eclipse-surface, #ffffff)',
      color: 'var(--eclipse-text-light, #1f2937)',
      border: '1px solid var(--eclipse-border, #e5e5e5)',
      borderRadius: '8px',
      fontSize: '14px'
    },
    ...options
  });
};

/**
 * Show a custom toast with notification data
 */
export const showSimpleNotification = (title, message, type = 'success', options = {}) => {
  const typeIcons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  };

  const icon = typeIcons[type] || '🔔';
  const text = `${icon} ${title}: ${message}`;

  toast[type](text, {
    duration: 5000,
    position: 'top-right',
    ...options
  });
};

export default { showNotificationToast, showSimpleNotification };
