import { Home, ClipboardList, Moon, Users, Sparkles } from 'lucide-react';
import { Tab } from '../types';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'tasks', label: 'المهام', icon: ClipboardList },
    { id: 'athkar', label: 'الأذكار', icon: Moon },
    { id: 'groups', label: 'المجموعات', icon: Users },
    { id: 'assistant', label: 'المساعد', icon: Sparkles },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d2217]/95 backdrop-blur-md border-t border-[#10b981]/20 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 flex-1",
                isActive ? "text-[#10b981]" : "text-gray-500"
              )}
            >
              <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive ? "opacity-100 translate-y-0" : "opacity-70"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-[#10b981] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
