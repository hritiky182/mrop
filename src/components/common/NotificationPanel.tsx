import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/formatters';
import { CheckCheck, Bell, ChevronRight, X } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = async (notif: typeof notifications[0]) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    if (notif.linkTo) {
      navigate(notif.linkTo);
      onClose();
    }
  };

  const severityDot = {
    critical: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    success: 'bg-emerald-500',
  };

  return (
    <div className="absolute right-0 top-12 w-96 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-copper-600" />
          <span className="text-xs font-semibold text-slate-800">Operational Alerts</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-[11px] font-medium text-copper-600 hover:text-copper-700 flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No active operational notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                notif.read ? 'bg-white hover:bg-slate-50' : 'bg-copper-50/20 hover:bg-copper-50/40'
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${severityDot[notif.severity]}`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h6
                    className={`text-xs truncate ${
                      notif.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'
                    }`}
                  >
                    {notif.title}
                  </h6>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatDate(notif.timestamp, 'HH:mm')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>

                {notif.linkTo && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-copper-600">
                    <span>View details</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center">
        Illustrative Operations Notification Stream — Red Ridge Mining
      </div>
    </div>
  );
};
