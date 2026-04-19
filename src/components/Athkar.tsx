import { Sun, Moon, Bed, Disc, RefreshCw, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { updateAthkarProgress, getAthkarProgress } from '../services/firebaseService';
import { AthkarProgress } from '../types';

const athkarData = {
  morning: [
    { id: 'm1', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', target: 1 },
    { id: 'm2', text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', target: 1 },
    { id: 'm3', text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', target: 3 },
    { id: 'm4', text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', target: 3 }
  ],
  evening: [
    { id: 'e1', text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', target: 1 },
    { id: 'e2', text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', target: 1 },
    { id: 'e3', text: 'أعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', target: 3 }
  ],
  sleep: [
    { id: 's1', text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا', target: 1 },
    { id: 's2', text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', target: 3 }
  ],
} as const;

export default function AthkarView() {
  const [activeCategory, setActiveCategory] = useState<'morning' | 'evening' | 'sleep' | 'tasbeeh'>('morning');
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [tasbeehCount, setTasbeehCount] = useState(0);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const unsub = getAthkarProgress(user.uid, (data) => {
      const p: Record<string, number> = {};
      data.forEach(item => {
        p[item.thikrId] = item.count;
      });
      setProgress(p);
      if (p['tasbeeh_general']) setTasbeehCount(p['tasbeeh_general']);
    });
    return () => unsub();
  }, [user]);

  const handleThikrIncrement = async (id: string, current: number, target: number) => {
    if (!user || current >= target) return;
    const newCount = current + 1;
    setProgress(prev => ({ ...prev, [id]: newCount }));
    await updateAthkarProgress(user.uid, id, newCount, target);
  };

  const handleTasbeehIncrement = async () => {
    if (!user) return;
    const newCount = tasbeehCount + 1;
    setTasbeehCount(newCount);
    await updateAthkarProgress(user.uid, 'tasbeeh_general', newCount, 1000000); // Massive target for total
  };

  const categories = [
    { id: 'morning', label: 'الصباح', icon: Sun },
    { id: 'evening', label: 'المساء', icon: Moon },
    { id: 'sleep', label: 'النوم', icon: Bed },
    { id: 'tasbeeh', label: 'التسبيح', icon: Disc },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="px-2">
        <h2 className="text-4xl font-extrabold mb-2 text-[#f8fafc]">الأذكار</h2>
        <p className="text-[#94a3b8] text-sm font-medium">احرص على ذكر الله في كل وقت</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-[20px] transition-all active:scale-95 border",
                isActive 
                  ? "bg-[#10b981] text-white border-[#10b981] shadow-xl shadow-emerald-500/20" 
                  : "bg-[#1a1f24] text-[#94a3b8] border-[#2d3748] hover:border-[#10b981]/30"
              )}
            >
              <Icon size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-white" : "text-[#94a3b8]")}>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4 px-1">
        {activeCategory === 'tasbeeh' ? (
          <div className="flex flex-col items-center justify-center py-12 gap-10">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center group">
              <div className="absolute inset-[-10px] rounded-full bg-[#10b981]/5 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-full border-[8px] border-[#2d3748]" />
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 288 288"
              >
                <circle 
                  cx="144" cy="144" r="136" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  strokeDasharray="854.5"
                  strokeDashoffset={854.5 - (854.5 * (tasbeehCount % 33)) / 33}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <button 
                onClick={handleTasbeehIncrement}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#1a1f24] border border-[#2d3748] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-2xl hover:border-[#10b981]/40 z-10"
              >
                <span className="text-5xl sm:text-7xl font-black text-[#f8fafc] font-mono tracking-tighter">{tasbeehCount % 33}</span>
                <span className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.2em] mt-2">سبحان الله</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="bg-[#1a1f24] px-8 py-3 rounded-2xl border border-[#2d3748] text-sm font-bold shadow-sm">
                <span className="text-[#94a3b8] uppercase tracking-[0.2em] text-[10px] ml-4">الإجمالي</span>
                <span className="text-[#f8fafc] font-mono text-xl">{tasbeehCount}</span>
              </div>
              <button 
                onClick={() => setTasbeehCount(0)}
                className="p-3.5 rounded-full bg-[#1a1f24] text-red-500 hover:bg-red-500/10 active:rotate-180 transition-all border border-[#2d3748]"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        ) : (
          (athkarData[activeCategory as keyof typeof athkarData] || []).map((thikr) => {
            const count = progress[thikr.id] || 0;
            const isDone = count >= thikr.target;
            return (
              <div 
                key={thikr.id}
                onClick={() => handleThikrIncrement(thikr.id, count, thikr.target)}
                className={cn(
                  "bg-[#1a1f24] rounded-[24px] p-8 border transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] group",
                  isDone ? "border-[#10b981]/40 opacity-70" : "border-[#2d3748] hover:border-[#10b981]/30"
                )}
              >
                {isDone && <Check size={48} className="absolute right-4 top-4 text-[#10b981]/10" strokeWidth={3} />}
                <p className={cn(
                  "text-2xl leading-[1.8] text-right font-medium relative z-10",
                  isDone ? "text-[#94a3b8]" : "text-[#f8fafc]"
                )}>
                  {thikr.text}
                </p>
                <div className="flex items-center justify-between relative z-10 pt-6 mt-6 border-t border-[#2d3748]">
                  <span className="text-[10px] text-[#94a3b8] font-black tracking-[0.2em] uppercase">التكرار المطلوب</span>
                  <div className={cn(
                    "rounded-xl px-5 py-2.5 border font-black text-lg transition-all",
                    isDone ? "bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]" : "bg-[#0f1214] border-[#2d3748] text-[#10b981]"
                  )}>
                    {count} / {thikr.target}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
