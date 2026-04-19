import { Plus, Trash2, CheckCircle2, Clock, Tag, X, Search, ArrowUpDown, Star, Users as UsersIcon, Briefcase, GraduationCap, Dumbbell, Heart, Circle } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Task, Group } from '../types';
import { auth } from '../lib/firebase';
import { getTasks, addTask, updateTaskStatus, deleteTask, getGroups } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('worship');
  const [isNewPriority, setIsNewPriority] = useState(false);
  const [newGroupId, setNewGroupId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'title'>('time');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const user = auth.currentUser;
  const { notify } = useNotification();

  useEffect(() => {
    if (!user) return;
    const unsubTasks = getTasks(user.uid, (data) => {
      setTasks(data);
    });
    const unsubGroups = getGroups(user.uid, (data) => {
      setGroups(data);
    });
    return () => {
      unsubTasks();
      unsubGroups();
    };
  }, [user]);

  // Reminder System
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;

      tasks.forEach(task => {
        if (!task.completed && task.time === timeStr) {
          notify('تذكير بالمهمة', `حان موعد: ${task.title}`, 'info');
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, notify]);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    await updateTaskStatus(id, !currentStatus);
  };

  const handleDeleteTask = async (id: string) => {
    // Removing window.confirm as it might be blocked on some mobile browsers
    await deleteTask(id);
    notify('تم الحذف', 'تم حذف المهمة بنجاح', 'success');
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    
    await addTask(user.uid, {
      title: newTaskTitle,
      time: newTaskTime || undefined,
      category: newTaskCategory,
      isPriority: isNewPriority,
      groupId: newGroupId || undefined,
      completed: false
    });
    
    notify('تمت الإضافة', 'تمت إضافة مهمة جديدة لقائمتك', 'success');
    setNewTaskTitle('');
    setNewTaskTime('');
    setNewGroupId('');
    setIsNewPriority(false);
    setIsAddModalOpen(false);
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // Default: time
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
  }, [tasks, searchTerm, sortBy, filterCategory]);

  const categories = [
    { id: 'worship', label: 'عبادة', icon: Heart, color: 'bg-rose-500', text: 'text-rose-500' },
    { id: 'work', label: 'عمل', icon: Briefcase, color: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'study', label: 'دراسة', icon: GraduationCap, color: 'bg-indigo-500', text: 'text-indigo-500' },
    { id: 'sport', label: 'رياضة', icon: Dumbbell, color: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'other', label: 'أخرى', icon: Circle, color: 'bg-gray-500', text: 'text-gray-500' },
  ];

  const days = [
    { n: 'ث', d: '21' },
    { n: 'ن', d: '20' },
    { n: 'ح', d: '19' },
    { n: 'س', d: '18', active: true },
    { n: 'ج', d: '17' },
    { n: 'خ', d: '16' },
    { n: 'أ', d: '15' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-3xl font-black text-[#f8fafc]">المهام</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-3 bg-[#10b981] text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all hover:scale-105"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="flex justify-between items-center px-1 overflow-x-auto pb-4 scrollbar-none gap-2">
        {days.map((day, i) => (
          <div 
            key={i} 
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl min-w-[50px] sm:min-w-[54px] transition-all border shrink-0",
              day.active 
                ? "bg-[#10b981] text-white border-[#10b981] shadow-xl shadow-emerald-500/20" 
                : "bg-[#1a1f24] text-[#94a3b8] border-[#2d3748] opacity-70"
            )}
          >
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{day.n}</span>
            <span className="text-base sm:text-lg font-extrabold">{day.d}</span>
            {day.active && <div className="w-1 h-1 rounded-full bg-white animate-pulse mt-0.5" />}
          </div>
        ))}
      </div>

      {/* Controls: Search, Sort, Filter */}
      <div className="px-2 space-y-4">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#10b981] transition-colors" size={18} />
          <input 
            type="text"
            placeholder="البحث عن مهمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1f24] border border-[#2d3748] rounded-2xl py-3.5 pr-12 pl-6 text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button 
            onClick={() => setSortBy('time')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all",
              sortBy === 'time' ? "bg-[#10b981] text-white border-[#10b981]" : "bg-[#1a1f24] text-[#94a3b8] border-[#2d3748]"
            )}
          >
            <Clock size={14} /> التوقيت
          </button>
          <button 
            onClick={() => setSortBy('priority')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all",
              sortBy === 'priority' ? "bg-amber-500 text-white border-amber-500" : "bg-[#1a1f24] text-[#94a3b8] border-[#2d3748]"
            )}
          >
            <Star size={14} /> الأهمية
          </button>
          <button 
            onClick={() => setSortBy('title')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all",
              sortBy === 'title' ? "bg-blue-500 text-white border-blue-500" : "bg-[#1a1f24] text-[#94a3b8] border-[#2d3748]"
            )}
          >
            <ArrowUpDown size={14} /> الاسم
          </button>
          <div className="w-px h-6 bg-[#2d3748] mx-2 shrink-0" />
          {[{ id: 'all', label: 'الكل' }, ...categories].map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all",
                filterCategory === cat.id ? "bg-[#f8fafc] text-[#0f1214] border-[#f8fafc]" : "bg-[#1a1f24] text-[#94a3b8] border-[#2d3748]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2">
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.2em]">قائمة المهام</span>
          <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/20">
            {filteredAndSortedTasks.filter(t => t.completed).length}/{filteredAndSortedTasks.length} مكتملة
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedTasks.map((task) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group bg-[#1a1f24] rounded-2xl p-5 border border-[#2d3748] transition-all hover:border-[#10b981]/30",
                  task.completed && "opacity-60 bg-[#161b21]"
                )}
              >
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    className="flex items-center gap-4 sm:gap-5 flex-1 text-right min-w-0"
                  >
                    <div className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center transition-all shrink-0",
                      task.completed ? "bg-[#10b981] border-[#10b981] text-white shadow-lg shadow-emerald-500/20" : "border-[#2d3748] bg-transparent text-transparent"
                    )}>
                      <CheckCircle2 size={20} sm:size={24} strokeWidth={3} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("text-base sm:text-[17px] font-extrabold text-[#f8fafc] tracking-tight truncate", task.completed && "line-through text-[#94a3b8]")}>
                          {task.title}
                        </h4>
                        {task.isPriority && <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5 overflow-hidden">
                        <span className={cn(
                          "text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md",
                          categories.find(c => c.id === task.category)?.color.replace('bg-', 'bg-').replace('-500', '-500/10'),
                          categories.find(c => c.id === task.category)?.text
                        )}>
                          {(() => {
                            const cat = categories.find(c => c.id === task.category);
                            const Icon = cat?.icon || Circle;
                            return <><Icon size={10} /> {cat?.label || 'أخرى'}</>;
                          })()}
                        </span>
                        {task.time && (
                          <span className="text-[9px] sm:text-[10px] text-[#94a3b8] font-black tracking-widest flex items-center gap-1 truncate">
                            <Clock size={10} className="text-[#10b981]" />
                            {task.time}
                          </span>
                        )}
                        {task.groupId && (
                          <span className="text-[9px] sm:text-[10px] text-[#10b981] font-black tracking-widest flex items-center gap-1 truncate">
                            <UsersIcon size={10} />
                            {groups.find(g => g.id === task.groupId)?.name || 'مجموعة'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="p-4 text-red-500 hover:bg-red-500/10 transition-all rounded-2xl flex items-center justify-center shrink-0 ml-1"
                    title="حذف المهمة"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-[#1a1f24]/30 border-2 border-dashed border-[#2d3748] rounded-[32px]">
              <p className="text-[#94a3b8] font-bold text-sm tracking-widest">ابدأ يومك بإضافة مهمة جديدة</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-[#0f1214]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#1a1f24] rounded-[32px] p-8 border border-[#2d3748] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#f8fafc]">مهمة جديدة</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-[#94a3b8] hover:text-[#f8fafc]">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.2em] px-2">العنوان</label>
                  <input 
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="مثال: قراءة صفحة من القرآن"
                    className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.2em] px-2">الوقت</label>
                    <input 
                      type="time" 
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.2em] px-2">التصنيف</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewTaskCategory(cat.id as any)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                              newTaskCategory === cat.id 
                                ? `${cat.color} border-transparent text-white shadow-lg` 
                                : "bg-[#0f1214] border-[#2d3748] text-[#94a3b8] hover:border-[#10b981]/30"
                            )}
                          >
                            <Icon size={18} />
                            <span className="text-[10px] font-bold">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.2em] px-2">المجموعة (اختياري)</label>
                  <select 
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 px-6 text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all appearance-none"
                  >
                    <option value="">بدون مجموعة</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f1214] rounded-2xl border border-[#2d3748]">
                  <div className="flex items-center gap-3">
                    <Star size={18} className={isNewPriority ? "text-amber-500 fill-amber-500" : "text-[#94a3b8]"} />
                    <span className="text-sm font-bold text-[#f8fafc]">تحديد كمهمة مميزة</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsNewPriority(!isNewPriority)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      isNewPriority ? "bg-[#10b981]" : "bg-[#2d3748]"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      isNewPriority ? "right-7" : "right-1"
                    )} />
                  </button>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#10b981] text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  إضافة المهمة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
