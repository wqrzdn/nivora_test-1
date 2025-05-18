import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import './Messaging.css';

interface UnreadBadgeProps {
  className?: string;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { getUnreadCount } = useMessage();
  
  // If no user or no unread messages, don't display the badge
  if (!user) return null;
  
  const unreadCount = getUnreadCount(user.id);
  if (unreadCount === 0) return null;
  
  return (
    <div className={`unread-badge ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
};

export default UnreadBadge; 