import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (title: string, message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((title: string, message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, removeNotification }}>
      {children}
      <div className="fixed top-20 right-4 z-[200] space-y-3 pointer-events-none w-full max-w-sm px-4 sm:px-0">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={cn(
                "pointer-events-auto w-full bg-[#1a1f24] border border-[#2d3748] rounded-2xl shadow-2xl p-4 flex gap-4 items-start relative overflow-hidden group",
                n.type === 'success' && "border-emerald-500/30",
                n.type === 'error' && "border-red-500/30",
                n.type === 'warning' && "border-amber-500/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'success' && "bg-emerald-500/10 text-emerald-500",
                n.type === 'error' && "bg-red-500/10 text-red-500",
                n.type === 'info' && "bg-blue-500/10 text-blue-500",
                n.type === 'warning' && "bg-amber-500/10 text-amber-500"
              )}>
                {n.type === 'success' && <CheckCircle2 size={24} />}
                {n.type === 'error' && <AlertCircle size={24} />}
                {n.type === 'info' && <Info size={24} />}
                {n.type === 'warning' && <Bell size={24} />}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-sm font-black text-white">{n.title}</h4>
                <p className="text-xs text-[#94a3b8] mt-1 font-medium leading-relaxed">{n.message}</p>
              </div>
              <button 
                onClick={() => removeNotification(n.id)}
                className="absolute top-4 left-4 p-1 text-[#94a3b8] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              <div className={cn(
                "absolute bottom-0 right-0 h-1 bg-gradient-to-l opacity-30",
                n.type === 'success' && "from-emerald-500 to-transparent",
                n.type === 'error' && "from-red-500 to-transparent",
                n.type === 'info' && "from-blue-500 to-transparent",
                n.type === 'warning' && "from-amber-500 to-transparent"
              )} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
