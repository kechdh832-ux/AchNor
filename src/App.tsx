/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import { Tab } from './types';
import { cn } from './lib/utils';
import HomeView from './components/Home';
import TasksView from './components/Tasks';
import AthkarView from './components/Athkar';
import GroupsView from './components/Groups';
import AssistantView from './components/Assistant';
import SettingsView from './components/Settings';
import { LogIn, Settings, WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import Login from './components/Login';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<Tab | 'settings'>('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('home');
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1214] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView />;
      case 'tasks': return <TasksView />;
      case 'athkar': return <AthkarView />;
      case 'groups': return <GroupsView />;
      case 'assistant': return <AssistantView />;
      case 'settings': return <SettingsView onBack={() => setActiveTab('home')} onLogout={handleLogout} />;
      default: return <HomeView />;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#0f1214] pb-20 selection:bg-[#10b981]/30" dir="rtl">
        {/* Connection Status Toast */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 right-6 z-[60] bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black shadow-2xl shadow-red-500/20 lg:bottom-10"
            >
              <WifiOff size={14} />
              أنت الآن تعمل بدون إنترنت
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header */}
        {activeTab !== 'settings' && (
        <header className="fixed top-0 left-0 right-0 h-[70px] px-4 sm:px-10 flex items-center justify-between z-40 bg-[rgba(15,18,20,0.85)] backdrop-blur-[12px] border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1f24] border border-[#2d3748] flex items-center justify-center p-1.5 shadow-lg shadow-emerald-500/5">
              <img 
                src="https://ais-pre-gqnrc73yv6lu6dtraibokd-125613358658.europe-west2.run.app/api/asset/7f6d2b63-0941-477f-a690-3cb83769c00b.png" 
                alt="Logo" 
                className="w-full h-full object-contain brightness-110"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-[#10b981] font-black">A</div>';
                }}
              />
            </div>
            <h1 className="text-[22px] font-[800] tracking-wider text-[#10b981]">ACHNOOR</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-sm text-[#f8fafc]">
              <div className="text-right leading-none">
                <p className="font-bold text-xs">أهلاً بك، {user.displayName?.split(' ')[0] || 'أشرف'}</p>
                <p className="text-[10px] text-[#10b981] mt-1 font-mono uppercase tracking-widest">HIMMA#5362</p>
              </div>
              <div className="w-9 h-9 rounded-xl border border-[#2d3748] bg-[#1a1f24] overflow-hidden shadow-inner">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2.5 rounded-xl bg-[#1a1f24] border border-[#2d3748] text-[#10b981] active:scale-95 transition-all hover:border-[#10b981]/30"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Layout */}
      <div className={cn(
        "max-w-[1200px] mx-auto",
        activeTab !== 'settings' && "pt-[70px]"
      )}>
        <div className={cn(
          activeTab === 'settings' 
            ? "" 
            : "grid lg:grid-cols-[240px_1fr_280px] gap-6 px-4 lg:px-10 py-6"
        )}>
          {/* Sidebar (Desktop Only) */}
          {activeTab !== 'settings' && (
            <aside className="hidden lg:flex flex-col gap-2 sidebar overflow-y-auto h-[calc(100vh-120px)] sticky top-[90px]">
              {[
                { id: 'home', label: 'الرئيسية' },
                { id: 'tasks', label: 'إدارة المهام' },
                { id: 'athkar', label: 'الأذكار والتسبيح' },
                { id: 'groups', label: 'المجموعات والتحدي' },
                { id: 'assistant', label: 'المساعد الذكي' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={cn(
                    "w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-medium",
                    activeTab === item.id 
                      ? "bg-[#1a1f24] text-[#10b981] font-bold border border-[#2d3748]" 
                      : "text-[#94a3b8] hover:bg-[#1a1f24]/50"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-sm border-2 transition-colors",
                    activeTab === item.id ? "border-[#10b981] bg-[#10b981]/10" : "border-[#2d3748]"
                  )} />
                  {item.label}
                </button>
              ))}
              <div className="mt-auto pt-6 border-t border-[#2d3748] text-[11px] text-[#94a3b8] text-center leading-relaxed">
                تطوير: أشرف بوصبع<br />
                <a href="https://youtube.com/@ach_noor" target="_blank" className="text-[#10b981] hover:underline">قناة المطور على يوتيوب</a>
              </div>
            </aside>
          )}

          {/* Center Content */}
          <main className={cn(
            activeTab === 'settings' ? 'w-full' : 'max-w-2xl mx-auto lg:max-w-none w-full'
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Right Panel (Desktop Only, shown during main tabs) */}
          {activeTab !== 'settings' && activeTab !== 'assistant' && (
            <aside className="hidden lg:flex flex-col gap-6 h-[calc(100vh-120px)] sticky top-[90px]">
              <div className="bg-[#1a1f24] border border-[#2d3748] rounded-[16px] p-5 text-center">
                <div className="text-[14px] text-[#94a3b8] mb-4 flex justify-between items-center px-1">
                  مستواك الإيماني
                </div>
                <div className="w-[100px] h-[100px] rounded-full border-[8px] border-[#2d3748] border-t-[#10b981] mx-auto flex flex-col items-center justify-center transition-transform hover:scale-105">
                  <span className="text-xl font-bold">1,250</span>
                  <span className="text-[10px] text-[#94a3b8]">نقطة</span>
                </div>
                <p className="text-[13px] mt-4 text-[#f8fafc]">أنت ضمن أفضل 5% هذا الأسبوع!</p>
              </div>

              <div className="bg-[#1a1f24] border border-[#2d3748] rounded-[16px] p-5">
                <div className="text-[14px] text-[#94a3b8] mb-4">مجموعتي</div>
                <div className="bg-[#10b981]/5 border border-dashed border-[#10b981] rounded-[12px] p-3 text-center">
                  <div className="text-xs text-[#94a3b8]">كود الانضمام</div>
                  <div className="font-mono text-lg text-[#10b981] font-bold mt-1">3JYR7CER</div>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { n: 'محمد علي', p: 4500 },
                    { n: 'أنت', p: 1250, primary: true },
                    { n: 'سامر خالد', p: 980 },
                  ].map((user, i) => (
                    <div key={i} className={cn(
                      "flex justify-between text-[13px] px-2 py-1.5 rounded-lg",
                      user.primary && "bg-[#10b981]/10 text-[#10b981] font-bold"
                    )}>
                      <span>{i + 1}. {user.n}</span>
                      <span>{user.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Tab Navigation (Mobile Only) */}
      {activeTab !== 'settings' && (
        <div className="lg:hidden">
          <BottomNav 
            activeTab={activeTab === 'settings' ? 'home' : activeTab as Tab} 
            setActiveTab={(tab) => setActiveTab(tab)} 
          />
        </div>
      )}
    </div>
    </NotificationProvider>
  );
}
