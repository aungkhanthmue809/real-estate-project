import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle, Clock, Mail, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationsContext';
import type { NotificationType } from '../types';

function getStatusIcon(type: NotificationType) {
  switch (type) {
    case 'PROPERTY_APPROVED':
      return <CheckCircle />;
    case 'PROPERTY_REJECTED':
      return <XCircle />;
    case 'CONTACT_MESSAGE_RECEIVED':
      return <Mail />;
    case 'PROPERTY_APPROVAL_REQUESTED':
      return <Clock />;
    case 'PROPERTY_SUBMITTED':
      return <CheckCircle />;
  }
}

function getStatusClass(type: NotificationType) {
  switch (type) {
    case 'PROPERTY_APPROVED':
      return 'approved';
    case 'PROPERTY_REJECTED':
      return 'rejected';
    case 'CONTACT_MESSAGE_RECEIVED':
      return 'contact';
    case 'PROPERTY_APPROVAL_REQUESTED':
      return 'pending';
    case 'PROPERTY_SUBMITTED':
      return 'submitted';
  }
}

function formatRelativeTime(createdAt: string) {
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return createdAt;

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) void refresh();
  };

  const selectNotification = async (id: number, link?: string | null) => {
    const notification = notifications.find((item) => item.id === id);
    if (notification && !notification.isRead) {
      try {
        await markRead(id);
      } catch {
        return;
      }
    }
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="notif-wrap" ref={boxRef}>
      <button
        className="notif-bell"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <Bell />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <div>
              <span className="notif-panel-title">Notifications</span>
              <span className="notif-panel-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
              </span>
            </div>
            {unreadCount > 0 && (
              <button className="notif-clear" onClick={() => void markAllRead()}>
                <CheckCircle /> Mark all as read
              </button>
            )}
          </div>
          <div className="notif-list">
            {loading && notifications.length === 0 ? (
              <div className="notif-empty"><p>Loading...</p></div>
            ) : error && notifications.length === 0 ? (
              <div className="notif-empty notif-error"><p>{error}</p></div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell />
                <p>No notifications yet.</p>
              </div>
            ) : (
              <>
                {error && <div className="notif-inline-error">{error}</div>}
                {notifications.map((notification) => (
                  <button
                    type="button"
                    className={`notif-item ${notification.isRead ? 'read' : 'unread'}`}
                    key={notification.id}
                    onClick={() => void selectNotification(notification.id, notification.link)}
                  >
                    <div className={`notif-icon ${getStatusClass(notification.type)}`}>
                      {getStatusIcon(notification.type)}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <p className="notif-title">{notification.title}</p>
                        {!notification.isRead && <span className="notif-unread-dot" aria-label="Unread" />}
                      </div>
                      <p className="notif-body">{notification.message}</p>
                      <span className="notif-time">{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
