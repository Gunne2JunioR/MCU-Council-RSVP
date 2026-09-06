import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatThaiDateTime } from '../utils/thaiDate';
import { BellRing, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useData();
  const { currentUser } = useAuth();

  const myNotifs = notifications.filter(
    n => n.recipientId === currentUser?.id || currentUser?.role === 'staff' || currentUser?.role === 'secretary'
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-mcu-primary" />
            <span>การแจ้งเตือน (Notifications)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            รายการแจ้งเตือนการประชุมและผลการพิจารณาคำขอของท่าน
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-card divide-y divide-gray-100 overflow-hidden text-xs">
        {myNotifs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">ไม่มีรายการแจ้งเตือนในขณะนี้</div>
        ) : (
          myNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 hover:bg-gray-50 transition cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-purple-50/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{n.title}</h4>
                  {!n.isRead && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-mcu-primary text-white font-medium">
                      ใหม่
                    </span>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-gray-400">{formatThaiDateTime(n.createdAt)}</div>
              </div>

              {n.linkUrl && (
                <Link
                  to={n.linkUrl}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-200 text-mcu-primary hover:bg-purple-50 flex items-center gap-1 text-[11px] font-semibold flex-shrink-0"
                >
                  <span>เปิดดู</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
