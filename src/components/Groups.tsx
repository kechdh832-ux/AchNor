import { Plus, UserPlus, Search, Trophy, MessageSquare, Users, X, Send, ArrowLeft, ClipboardList, CheckCircle2, Clock, Star, Copy, Check } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { getGroups, createGroup, joinGroupByCode, sendMessage, getMessages, getLeaderboard, getGroupTasks, updateTaskStatus } from '../services/firebaseService';
import { Group, Message, UserProfile, Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';

export default function GroupsView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeChat, setActiveChat] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupTasks, setGroupTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'points' | 'weeklyPoints'>('weeklyPoints');
  const [inviteCode, setInviteCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = auth.currentUser;
  const { notify } = useNotification();

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!user) return;
    const unsubGroups = getGroups(user.uid, (data) => {
      setGroups(data);
    });
    const unsubLeaderboard = getLeaderboard(leaderboardType, setLeaderboard);
    return () => {
      unsubGroups();
      unsubLeaderboard();
    };
  }, [user, leaderboardType]);

  useEffect(() => {
    if (!activeChat) return;
    const unsubMsgs = getMessages(activeChat.id, setMessages);
    const unsubTasks = getGroupTasks(activeChat.id, setGroupTasks);
    return () => {
      unsubMsgs();
      unsubTasks();
    };
  }, [activeChat]);

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    notify('تم النسخ', 'تم نسخ كود الدعوة بنجاح', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleTask = async (id: string, current: boolean) => {
    await updateTaskStatus(id, !current);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;
    await createGroup(user.uid, newGroupName, newGroupDesc);
    setNewGroupName('');
    setNewGroupDesc('');
    setIsCreateModalOpen(false);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !user) return;
    try {
      await joinGroupByCode(user.uid, inviteCode.toUpperCase());
      setInviteCode('');
      setIsJoinModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return;
    await sendMessage(activeChat.id, user.uid, user.displayName || 'Unnamed', newMessage);
    setNewMessage('');
  };

  if (activeChat) {
    return (
      <div className="flex flex-col h-[calc(100vh-14rem)] sm:h-[calc(100vh-12rem)] animate-in slide-in-from-left-4 duration-500">
        <div className="flex flex-col gap-4 mb-6 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setActiveChat(null);
                  setActiveTab('chat');
                }} 
                className="p-2.5 sm:p-3 bg-[#1a1f24] rounded-xl text-[#94a3b8] hover:text-[#10b981] transition-all border border-[#2d3748]"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#f8fafc] line-clamp-1">{activeChat.name}</h3>
                  <p className="text-[9px] text-[#10b981] font-black uppercase tracking-widest">{activeChat.members.length} عضو</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => copyInviteCode(activeChat.inviteCode)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0f1214] text-[#94a3b8] rounded-lg border border-[#2d3748] text-[10px] font-bold active:scale-95 transition-all"
            >
              {copiedCode ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
              {activeChat.inviteCode}
            </button>
          </div>

          <div className="flex p-1 bg-[#1a1f24] rounded-xl border border-[#2d3748]">
            <button 
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all",
                activeTab === 'chat' ? "bg-[#10b981] text-white" : "text-[#94a3b8] hover:text-[#f8fafc]"
              )}
            >
              <MessageSquare size={14} /> الدردشة
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all",
                activeTab === 'tasks' ? "bg-[#10b981] text-white" : "text-[#94a3b8] hover:text-[#f8fafc]"
              )}
            >
              <ClipboardList size={14} /> مهام جماعية
            </button>
          </div>
        </div>

        {activeTab === 'chat' ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-none pb-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col",
                      m.senderId === user?.uid ? "items-start" : "items-end"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-[20px] shadow-sm",
                      m.senderId === user?.uid 
                        ? "bg-[#10b981] text-white rounded-tr-none font-bold" 
                        : "bg-[#1a1f24] text-[#f8fafc] border border-[#2d3748] rounded-tl-none font-medium"
                    )}>
                      {m.senderId !== user?.uid && <p className="text-[9px] text-[#10b981] font-black mb-1 uppercase tracking-widest">{m.senderName}</p>}
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <MessageSquare size={48} className="mb-4 text-[#94a3b8]" />
                  <p className="text-sm font-bold text-[#94a3b8]">ابدأ المحادثة الآن</p>
                </div>
              )}
            </div>

            <div className="mt-4 px-1 pb-4">
              <div className="relative group">
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالة للمجموعة..."
                  className="w-full bg-[#1a1f24] border border-[#2d3748] rounded-[24px] py-5 pr-6 pl-16 text-sm text-[#f8fafc] focus:outline-none focus:border-[#10b981]/40 transition-all placeholder:text-[#94a3b8]/40 shadow-xl"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-3.5 bg-[#10b981] text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  <Send size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-none pb-4">
            <AnimatePresence>
              {groupTasks.map((task) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "flex items-center gap-4 bg-[#1a1f24] p-5 rounded-2xl border border-[#2d3748] transition-all",
                    task.completed && "opacity-60 bg-[#161b21]"
                  )}
                >
                  <button 
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className={cn(
                      "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                      task.completed ? "bg-[#10b981] border-[#10b981] text-white" : "border-[#2d3748]"
                    )}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("text-base font-extrabold text-[#f8fafc] truncate", task.completed && "line-through")}>{task.title}</h4>
                      {task.isPriority && <Star size={14} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 opacity-60">
                      <span className="text-[10px] font-bold text-[#94a3b8] flex items-center gap-1 uppercase tracking-widest">
                        <Clock size={12} className="text-[#10b981]" />
                        {task.time || 'أي وقت'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {groupTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-40 py-20 bg-[#1a1f24]/30 border-2 border-dashed border-[#2d3748] rounded-[32px]">
                <ClipboardList size={48} className="mb-4 text-[#94a3b8]" />
                <p className="text-sm font-bold text-[#94a3b8]">لا توجد مهام جماعية بعد</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f8fafc]">المجموعات</h2>
        <div className="flex gap-2 sm:gap-3">
           <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1a1f24] text-[#10b981] rounded-xl border border-[#2d3748] text-[11px] sm:text-xs font-bold active:scale-95 transition-all hover:border-[#10b981]/30"
          >
            <UserPlus size={16} sm:size={18} />
            انضمام
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#10b981] text-white rounded-xl text-[11px] sm:text-xs font-extrabold active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
          >
            <Plus size={16} sm:size={18} strokeWidth={3} />
            إنشاء
          </button>
        </div>
      </div>

      {/* Search Groups */}
      <div className="relative px-2">
        <Search className="absolute right-7 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
        <input 
          type="text" 
          placeholder="ابحث عن مجموعة..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1f24] border border-[#2d3748] rounded-[20px] py-4 pr-14 pl-6 text-sm text-[#f8fafc] focus:outline-none focus:border-[#10b981]/40 transition-all placeholder:text-[#94a3b8]/50 shadow-inner"
        />
      </div>

      <div className="px-1 space-y-5">
        <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-[0.2em] px-2 mb-4">مجموعاتك</h3>
        {filteredGroups.map((group) => (
          <div 
            key={group.id}
            onClick={() => setActiveChat(group)}
            className="bg-[#1a1f24] rounded-[24px] p-7 border border-[#2d3748] space-y-6 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all cursor-pointer group hover:border-[#10b981]/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[18px] bg-[#0f1214] flex items-center justify-center text-[#10b981] border border-[#2d3748] shadow-inner group-hover:scale-105 transition-transform">
                  <Users size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-[#f8fafc]">{group.name}</h4>
                  <p className="text-[#94a3b8] text-sm mt-1">{group.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-bold block mb-1">الأعضاء</span>
                <span className="text-xs font-black bg-[#10b981]/15 text-[#10b981] px-3 py-1 rounded-full border border-[#10b981]/20">{group.members.length} عضو</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-[#2d3748]">
              <div className="flex gap-2">
                <button className="p-3.5 rounded-xl bg-[#0f1214] text-[#10b981] hover:bg-[#10b981]/15 transition-all border border-[#2d3748]">
                  <MessageSquare size={20} />
                </button>
                <button className="p-3.5 rounded-xl bg-[#0f1214] text-amber-500 hover:bg-amber-500/15 transition-all border border-[#2d3748]">
                  <Trophy size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-[0.2em] font-bold">الدعوة</span>
                <span className="text-sm font-mono font-black text-[#10b981] bg-[#0f1214] px-4 py-1.5 rounded-xl border border-[#10b981]/30 tracking-widest">{group.inviteCode}</span>
              </div>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="py-20 text-center bg-[#1a1f24]/30 border-2 border-dashed border-[#2d3748] rounded-[32px]">
            <p className="text-[#94a3b8] font-bold text-sm">ليس لديك مجموعات نشطة حالياً</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-[#0f1214]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[#1a1f24] p-8 rounded-[32px] border border-[#2d3748] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black text-white">إنشاء مجموعة تحدي</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="اسم المجموعة" className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-white focus:border-[#10b981] outline-none" required />
                <textarea value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="وصف المجموعة" className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-white focus:border-[#10b981] outline-none h-32" />
                <button type="submit" className="w-full bg-[#10b981] text-white py-4 rounded-2xl font-black shadow-lg">بدء التحدي</button>
              </form>
            </motion.div>
          </div>
        )}

        {isJoinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsJoinModalOpen(false)} className="absolute inset-0 bg-[#0f1214]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[#1a1f24] p-8 rounded-[32px] border border-[#2d3748] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black text-white">الانضمام لمجموعة</h3>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="كود الانضمام (مثلاً: 3JYR7CER)" className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-white text-center font-mono font-black text-xl tracking-widest focus:border-[#10b981] outline-none" required />
                <button type="submit" className="w-full bg-[#10b981] text-white py-4 rounded-2xl font-black shadow-lg">انضمام الآن</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard CTA */}
      <section className="px-2 pt-6">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-[24px] p-7 border border-amber-500/20 flex items-center justify-between group hover:from-amber-500/15 hover:to-orange-500/15 transition-all">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Trophy size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-[#f8fafc] text-lg">لوحة المتصدرين</h4>
              <p className="text-xs text-[#94a3b8] mt-1 font-medium">تنافس مع أصدقائك في العبادات!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsLeaderboardOpen(true)}
            className="text-amber-500 font-black text-xs uppercase tracking-widest bg-amber-500/10 px-5 py-2.5 rounded-xl border border-amber-500/20 active:scale-95 transition-all hover:bg-amber-500/20"
          >
            عرض
          </button>
        </div>
      </section>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLeaderboardOpen(false)} className="absolute inset-0 bg-[#0f1214]/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }} 
              className="relative bg-[#1a1f24] rounded-[32px] border border-[#2d3748] w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 sm:p-8 border-b border-[#2d3748] bg-gradient-to-r from-amber-500/5 to-transparent space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Trophy size={24} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">المتصدرون</h3>
                  </div>
                  <button onClick={() => setIsLeaderboardOpen(false)} className="p-2 text-[#94a3b8] hover:text-[#f8fafc]">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex p-1 bg-[#0f1214] rounded-xl border border-[#2d3748]">
                  <button 
                    onClick={() => setLeaderboardType('weeklyPoints')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      leaderboardType === 'weeklyPoints' ? "bg-amber-500 text-amber-950" : "text-[#94a3b8] hover:text-[#f8fafc]"
                    )}
                  >
                    أسبوعي
                  </button>
                  <button 
                    onClick={() => setLeaderboardType('points')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      leaderboardType === 'points' ? "bg-amber-500 text-amber-950" : "text-[#94a3b8] hover:text-[#f8fafc]"
                    )}
                  >
                    كلي
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-none">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.uid} 
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all",
                      player.uid === user?.uid 
                        ? "bg-[#10b981]/10 border-[#10b981]/30" 
                        : "bg-[#0f1214] border-[#2d3748]"
                    )}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0",
                        index === 0 ? "bg-amber-400 text-amber-950" :
                        index === 1 ? "bg-slate-300 text-slate-800" :
                        index === 2 ? "bg-orange-400 text-orange-950" :
                        "bg-[#1a1f24] text-[#94a3b8]"
                      )}>
                        {index + 1}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#1a1f24] border border-[#2d3748] flex items-center justify-center text-[#f8fafc] font-bold overflow-hidden shrink-0">
                        {player.photoURL ? (
                          <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                        ) : (
                          player.displayName?.[0] || player.email?.[0] || '?'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#f8fafc] text-xs sm:text-sm truncate">
                          {player.displayName}
                        </p>
                        <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest mt-0.5 truncate shrink-0">
                          {player.uid === user?.uid ? 'أنت' : 'محارب نور'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-[#10b981] text-sm sm:text-base">{leaderboardType === 'points' ? player.points : (player.weeklyPoints || 0)}</p>
                      <p className="text-[8px] sm:text-[9px] text-[#94a3b8] font-bold uppercase tracking-tight">نقطة</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
