/**
 * Custom notification toast component
 */
const NotificationToast = ({ notification, onDismiss, onNavigate }) => {
  const handleClick = () => {
    if (onNavigate && notification.relatedEntity) {
      onNavigate(notification);
    }
    onDismiss();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'like':
        return 'text-red-500';
      case 'comment':
        return 'text-blue-500';
      case 'follow':
        return 'text-green-500';
      case 'achievement':
        return 'text-yellow-500';
      case 'contest_update':
        return 'text-purple-500';
      default:
        return 'text-stellar-blue';
    }
  };

  return (
    <div className="max-w-md w-full bg-eclipse-surface dark:bg-space-darker shadow-space-elevated rounded-lg pointer-events-auto border border-eclipse-border dark:border-space-gray overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-eclipse-border/50 dark:hover:bg-space-gray/50 transition-colors"
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 text-2xl ${getTypeColor(notification.type)}`}>
            {notification.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-eclipse-text-light dark:text-space-text">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-eclipse-muted-light dark:text-space-muted line-clamp-2">
              {notification.message}
            </p>
            {notification.sender && (
              <p className="mt-1 text-xs text-stellar-blue">
                from {notification.sender.username}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-2 text-eclipse-muted-light dark:text-space-muted hover:text-eclipse-text-light dark:hover:text-space-text transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
