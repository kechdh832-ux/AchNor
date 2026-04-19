import { Flame, CheckCircle, Calendar, BookOpen, Moon, Users, Sparkles, User, Trophy, ClipboardList, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { getTasks, getGroups, getUserProfile, checkAndResetWeeklyPoints, deleteTask } from '../services/firebaseService';
import { Task, Group, UserProfile } from '../types';
import { cn } from '../lib/utils';

export default function HomeView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    
    // Weekly reset check
    checkAndResetWeeklyPoints(user.uid);

    const unsubTasks = getTasks(user.uid, setTasks);
    const unsubGroups = getGroups(user.uid, setGroups);
    const unsubProfile = getUserProfile(user.uid, setProfile);

    return () => {
      unsubTasks();
      unsubGroups();
      unsubProfile();
    };
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);

  const stats = [
    { label: 'نقاط', val: profile?.points || 0, icon: Trophy, color: 'text-amber-500' },
    { label: 'مكتملة', val: todayTasks.filter(t => t.completed).length, icon: CheckCircle, color: 'text-[#10b981]' },
    { label: 'المهام', val: todayTasks.length, icon: ClipboardList, color: 'text-blue-500' },
  ];

  const quickAccess = [
    { label: 'الدروس', icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'المساعد', icon: Sparkles, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'المجموعات', icon: Users, color: 'bg-purple-500/10 text-purple-500' },
    { label: 'الأذكار', icon: Moon, color: 'bg-amber-500/10 text-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Card - Dynamic AI Version */}
      <section className="relative overflow-hidden p-6 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#1a1f24] to-[#111827] border border-[#2d3748] shadow-2xl">
        <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-[#10b981] blur-[120px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-emerald-500/10 blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-right">
            <h2 className="text-3xl font-black text-[#f8fafc] tracking-tight">السلام عليكم ورحمة الله</h2>
            <p className="text-[#94a3b8] text-sm mt-2 max-w-md font-medium leading-relaxed">
              مرحباً بك يا <span className="text-[#10b981] font-black">{profile?.displayName || 'أشرف'}</span>، 
              لديك <span className="text-white font-bold">{todayTasks.filter(t => !t.completed).length} مهام</span> متبقية لليوم. لنجعل يومنا زاخراً بالعبادة!
            </p>
          </div>
          <div className="w-20 h-20 rounded-[24px] bg-[#10b981]/15 flex items-center justify-center text-[#10b981] font-black text-4xl border border-[#10b981]/30 shadow-2xl shadow-emerald-500/10 transition-transform hover:rotate-3">
             {profile?.displayName?.[0] || 'أ'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0f1214]/60 backdrop-blur-sm rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 flex flex-col items-center justify-center gap-1 sm:gap-2 border border-[#2d3748] transition-all hover:border-[#10b981]/50 shadow-inner group cursor-default">
              {stat.icon && <stat.icon className={cn(stat.color, "transition-transform group-hover:scale-110")} size={18} />}
              <span className="text-xl sm:text-2xl font-black text-[#f8fafc] tracking-tighter">{stat.val}</span>
              <span className="text-[9px] sm:text-[10px] text-[#94a3b8] font-black uppercase tracking-wider sm:tracking-[0.2em] text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Grid */}
      <div className="grid sm:grid-cols-2 gap-8">
        {/* Today's Verse - AI Selected Feel */}
        <section className="bg-[#1a1f24] rounded-[24px] p-7 border border-[#2d3748] space-y-4 hover:border-[#10b981]/40 transition-all group shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] group-hover:rotate-12 transition-transform">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em]">توجيه رباني</span>
          </div>
          <p className="text-xl font-bold leading-[1.8] text-[#f8fafc] text-right">"فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ"</p>
          <div className="flex items-center justify-between pt-4 border-t border-[#2d3748]">
            <span className="text-[11px] text-[#94a3b8] font-bold italic tracking-widest uppercase">سورة البقرة · ١٥٢</span>
            <button className="p-2.5 rounded-xl bg-[#0f1214] text-[#10b981] border border-[#2d3748] active:scale-90 transition-all">
              <Sparkles size={16} />
            </button>
          </div>
        </section>

        {/* Dynamic Groups Summary */}
        <section className="bg-[#1a1f24] rounded-[24px] p-7 border border-[#2d3748] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.3em]">المجموعات النشطة</h3>
            <span className="text-[10px] font-black text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">{groups.length} مجموعات</span>
          </div>
          <div className="space-y-4">
            {groups.slice(0, 2).map((group, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#0f1214] p-4 rounded-2xl border border-[#2d3748] hover:border-[#10b981]/30 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[#1a1f24] flex items-center justify-center text-[#10b981]">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#f8fafc]">{group.name}</p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">{group.members.length} عضو يتنافسون</p>
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="text-[11px] text-[#94a3b8] text-center font-bold uppercase tracking-widest py-4">انضم لمجموعة لبدء التحدي</p>}
          </div>
        </section>
      </div>

      {/* Recent Tasks List */}
      <section className="bg-[#1a1f24] rounded-[24px] p-8 border border-[#2d3748] space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.3em]">المهام العاجلة</h3>
          <button className="text-[#10b981] text-xs font-black uppercase tracking-widest hover:underline underline-offset-8 transition-all">مراجعة الكل</button>
        </div>
        <div className="space-y-4">
          {todayTasks.filter(t => !t.completed).slice(0, 3).map((task) => (
            <div key={task.id} className="bg-[#0f1214]/40 rounded-2xl p-4 sm:p-5 border border-[#2d3748] flex items-center justify-between group cursor-pointer hover:border-[#10b981]/40 transition-all shadow-inner">
              <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                <div className={cn(
                  "w-3 h-3 rounded-full shadow-lg shrink-0",
                  task.category === 'worship' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-500 shadow-blue-500/20"
                )} />
                <div className="min-w-0">
                  <p className="font-bold text-[#f8fafc] tracking-tight truncate">{task.title}</p>
                  <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.2em] mt-1 truncate">{task.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-2 text-red-500/60 hover:text-red-500 transition-colors bg-red-500/5 rounded-lg sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-[#10b981] flex items-center justify-center transition-all group-hover:bg-[#10b981]/15 shrink-0">
                  <CheckCircle className="text-transparent" size={18} />
                </div>
              </div>
            </div>
          ))}
          {todayTasks.filter(t => !t.completed).length === 0 && (
            <div className="py-12 text-center text-[#94a3b8] font-bold text-xs uppercase tracking-widest border border-dashed border-[#2d3748] rounded-[24px]">
              جميع مهامك منجزة لهذا اليوم، ابحث عن فرصة جديدة للخير!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
