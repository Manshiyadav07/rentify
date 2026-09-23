import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { Bell, Check, BookOpen, CreditCard, AlertCircle, Clock } from 'lucide-react';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'RENTAL_CONFIRMED':
      return <BookOpen size={16} className="text-emerald-500" />;
    case 'PAYMENT_SUCCESS':
      return <CreditCard size={16} className="text-blue-500" />;
    case 'OVERDUE':
      return <AlertCircle size={16} className="text-rose-500" />;
    case 'DUE_SOON':
    case 'RESERVATION_AVAILABLE':
      return <Clock size={16} className="text-amber-500" />;
    default:
      return <Bell size={16} className="text-indigo-500" />;
  }
};

const NotificationMenu = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-4 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] text-blue-600 font-medium hover:underline inline-block mt-1"
                      >
                        View details &rarr;
                      </Link>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
