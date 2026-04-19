import { ArrowRight, User as UserIcon, Mail, Lock, Bell, Youtube, Trash2, LogOut, Info, Globe, Moon, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { updateUserPhoto } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function SettingsView({ onBack, onLogout }: SettingsViewProps) {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState('');
  const user = auth.currentUser;

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoURL.trim()) return;
    await updateUserPhoto(photoURL);
    setIsPhotoModalOpen(false);
    setPhotoURL('');
  };

  const handleLogout = async () => {
    onLogout();
  };

  const settingsGroups = [
    {
      label: 'الحساب',
      items: [
        { id: 'edit-profile', label: 'تعديل الاسم والبريد', icon: UserIcon, color: 'text-blue-500' },
        { id: 'change-password', label: 'تغيير كلمة المرور', icon: Lock, color: 'text-purple-500' },
      ]
    },
    {
      label: 'الإشعارات',
      items: [
        { id: 'toggle-notifications', label: 'تفعيل الإشعارات', icon: Bell, color: 'text-amber-500', isToggle: true, checked: true },
        { id: 'morning-reminder', label: 'تذكير أذكار الصباح', icon: Moon, color: 'text-emerald-500', isToggle: true, checked: true },
      ]
    },
    {
      label: 'اللغة / Language',
      items: [
        { id: 'language', label: 'العربية', icon: Globe, color: 'text-cyan-500' }
      ]
    },
    {
      label: 'المطور',
      items: [
        { id: 'dev-info', label: 'أشرف بوصبع - ACHNOOR', description: 'مطوّر تطبيقات · 2026 · 1.0.0', icon: null, isCustom: true },
        { id: 'youtube', label: 'اشترك في قناة أشرف على يوتيوب', icon: Youtube, color: 'text-red-500', isExternal: true, link: 'https://youtube.com/@ach_noor' },
      ]
    },
    {
      label: 'أخرى',
      items: [
        { id: 'about', label: 'حول التطبيق', icon: Info, color: 'text-[#10b981]' },
        { id: 'logout', label: 'تسجيل الخروج', icon: LogOut, color: 'text-orange-500', action: handleLogout },
        { id: 'delete-account', label: 'حذف الحساب', icon: Trash2, color: 'text-red-500' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1214] pb-10 overflow-x-hidden selection:bg-[#10b981]/30">
      <header className="h-20 px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-[rgba(15,18,20,0.9)] backdrop-blur-md z-30 border-b border-[#2d3748]">
        <h2 className="text-2xl font-[800] text-[#f8fafc] tracking-tight">الإعدادات</h2>
        <button 
          onClick={onBack}
          className="p-3 bg-[#1a1f24] rounded-2xl border border-[#2d3748] text-[#10b981] active:scale-90 transition-all hover:border-[#10b981]/30"
        >
          <ArrowRight size={22} strokeWidth={2.5} />
        </button>
      </header>

      <div className="px-5 sm:px-10 space-y-10 mt-8">
        {/* Profile Card - Dynamic Version */}
        <div className="bg-gradient-to-br from-[#1a1f24] to-[#111827] rounded-[24px] p-8 border border-[#2d3748] flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-[-40px] left-[-40px] w-24 h-24 bg-[#10b981]/10 blur-3xl rounded-full" />
          <div className="w-20 h-20 rounded-full bg-[#0f1214] border-2 border-[#10b981] flex items-center justify-center text-[#10b981] text-4xl font-black shadow-xl shadow-emerald-500/10 group-hover:scale-105 transition-transform overflow-hidden relative">
             <img src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`} className="w-full h-full object-cover" alt="avatar" />
             <button 
               onClick={() => setIsPhotoModalOpen(true)}
               className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
             >
               <Camera size={24} className="text-white" />
             </button>
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-2xl font-black text-[#f8fafc] tracking-tight">{user?.displayName || 'مستخدم'}</h3>
            <p className="text-sm text-[#94a3b8] mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] bg-[#10b981]/15 text-[#10b981] px-3 py-1 rounded-lg font-mono font-black tracking-[0.2em] border border-[#10b981]/20 uppercase">HIMMA#{user?.uid.substring(0, 4)}</span>
            </div>
          </div>
        </div>

        {settingsGroups.map((group, i) => (
          <div key={i} className="space-y-4">
            <h4 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.3em] px-3 ml-2">{group.label}</h4>
            <div className="bg-[#1a1f24] rounded-[24px] overflow-hidden border border-[#2d3748] divide-y divide-[#2d3748]">
              {group.items.map((item) => (
                <div key={item.id} className="p-1.5 transition-colors">
                  {item.isCustom ? (
                    <div className="p-4 flex items-center gap-5 bg-[#10b981]/5 rounded-[18px] border border-[#10b981]/10 m-1">
                       <div className="w-14 h-14 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] text-2xl font-black shadow-lg shadow-emerald-500/5">
                        أ
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-[#f8fafc] text-[15px]">{item.label}</h5>
                        </div>
                        <p className="text-[11px] text-[#94a3b8] mt-1 font-medium leading-relaxed uppercase tracking-wider">{item.description}</p>
                      </div>
                    </div>
                  ) : item.isExternal ? (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 p-5 hover:bg-[#10b981]/5 rounded-[18px] transition-all group"
                    >
                      <div className={cn("w-11 h-11 rounded-xl bg-[#0f1214] flex items-center justify-center border border-[#2d3748] group-hover:border-[#10b981]/30 transition-all", item.color)}>
                        {item.icon && <item.icon size={22} strokeWidth={2.5} />}
                      </div>
                      <span className={cn("flex-1 text-sm font-bold uppercase tracking-wide", item.color)}>{item.label}</span>
                      <ArrowRight size={18} className="text-[#2d3748] -rotate-[135deg] group-hover:text-[#10b981] transition-all" />
                    </a>
                  ) : (
                    <button 
                      onClick={(item as any).action}
                      className="w-full flex items-center gap-5 p-5 hover:bg-[#10b981]/5 rounded-[18px] transition-all group"
                    >
                      <div className={cn("w-11 h-11 rounded-xl bg-[#0f1214] flex items-center justify-center border border-[#2d3748] group-hover:border-[#10b981]/30 transition-all shadow-inner", item.color)}>
                        {item.icon && <item.icon size={22} strokeWidth={2.5} />}
                      </div>
                      <span className="flex-1 text-right text-sm font-bold text-[#f8fafc] tracking-wide">{item.label}</span>
                      {item.isToggle ? (
                         <div className={cn(
                          "w-12 h-6 rounded-full transition-all relative border border-[#2d3748]",
                          item.checked ? "bg-[#10b981]" : "bg-[#0f1214]"
                        )}>
                          <div className={cn(
                            "absolute top-1 left-1 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-md",
                            item.checked ? "translate-x-6" : "translate-x-0"
                          )} />
                        </div>
                      ) : (
                        <ArrowRight size={18} className="text-[#2d3748] group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center py-12 opacity-20 select-none">
          <p className="text-[9px] font-mono tracking-[1.5em] uppercase font-black text-[#94a3b8]">Built with absolute faith</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-[1px] w-8 bg-[#94a3b8]/30" />
            <p className="text-[10px] font-mono tracking-[0.5em] italic text-[#10b981]">© 2026 ACHNOOR</p>
            <div className="h-[1px] w-8 bg-[#94a3b8]/30" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPhotoModalOpen(false)} className="absolute inset-0 bg-[#0f1214]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[#1a1f24] p-8 rounded-[32px] border border-[#2d3748] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black text-white">تحديث الصورة الشخصية</h3>
              <p className="text-xs text-[#94a3b8] font-medium leading-relaxed">أدخل رابط الصورة (URL) التي ترغب في استخدامها كصورة شخصية.</p>
              <form onSubmit={handleUpdatePhoto} className="space-y-4">
                <input 
                  value={photoURL} 
                  onChange={e => setPhotoURL(e.target.value)} 
                  placeholder="https://example.com/photo.jpg" 
                  className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-white text-sm focus:border-[#10b981] outline-none" 
                  required 
                />
                <button type="submit" className="w-full bg-[#10b981] text-white py-4 rounded-2xl font-black shadow-lg">تحديث الآن</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
