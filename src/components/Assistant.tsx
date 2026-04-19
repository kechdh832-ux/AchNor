import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Trash2, MessageCircle, Zap, Shield, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { auth } from '../lib/firebase';
import { getAssistantMessages, saveAssistantMessage, deleteAssistantHistory } from '../services/firebaseService';
import { Message } from '../types';
import { useNotification } from '../contexts/NotificationContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `أنت "المساعد الذكي" لتطبيق ACHNOOR، المساعد الإسلامي المتطور الذي صممه المطور "أشرف بوصبع" (Ashraf Bousaba). أنت لست مجرد برنامج، بل رفيق رحلة المسلم نحو الانضباط والروحانية.

مهمتك:
1. التحفيز اليومي: شجع المستخدم على إنجاز مهامه بأسلوب قوي ومصدره الثقة بالله.
2. التذكير بالعبادة: إذا سألك المستخدم عن الذكر أو الصلاة، قدم له نصائح روحية ومعلومات دقيقة عن فضل الأذكار.
3. التوجيه في التطبيق:
   - المهام: وجه المستخدم لاستخدام لوحة المهام لتنظيم وقته (عمل، دراسة، رياضة، عبادة).
   - الأذكار: شجعه على الالتزام بأذكار الصباح والمساء والسبحة الإلكترونية.
   - المجموعات: حفزه على التنافس مع أصدقائه في لوحة المتصدرين (Leaderboard).
4. المعرفة الإسلامية: أجب عن الأسئلة الدينية الأساسية بذكاء، مع حث المستخدم دائماً على طلب العلم الشرعي من أهله.

الأسلوب:
- لغة عربية فصحى عصرية وبسيطة.
- استخدام الكلمات المحفزة مثل: "عزم"، "همة"، "نور"، "ارتقاء".
- استخدام الإيموجي بشكل احترافي (🌙, ✨, 🚀, 📚, 🕯️).
- ابدأ ردودك غالباً بعبارات مثل "بكل سرور يا محارب النور" أو "حيّاك الله في رحاب أشور".`;

export default function AssistantView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const user = auth.currentUser;
  const { notify } = useNotification();

  useEffect(() => {
    if (!user) return;
    const unsub = getAssistantMessages(user.uid, (data) => {
      setMessages(data);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleClearChat = async () => {
    if (!user) return;
    try {
      await deleteAssistantHistory(user.uid);
      notify('تم المسح', 'تم مسح سجل المحادثة بنجاح', 'success');
    } catch (error) {
      console.error('Clear Chat Error:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      senderId: 'user',
      senderName: user.displayName || 'User',
      createdAt: new Date()
    };

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to Firebase
      await saveAssistantMessage(user.uid, userMsg);

      // Call Gemini
      // Ensure history alternates roles for Gemini and merge consecutive roles
      const mergedContent: any[] = [];
      messages.forEach(m => {
        const role = m.senderId === 'user' ? 'user' : 'model';
        const last = mergedContent[mergedContent.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += "\n" + m.text;
        } else {
          mergedContent.push({ role, parts: [{ text: m.text }] });
        }
      });

      // Handle current input by either merging with last user turn or adding new turn
      const lastToken = mergedContent[mergedContent.length - 1];
      if (lastToken && lastToken.role === 'user') {
        lastToken.parts[0].text += "\n" + currentInput;
      } else {
        mergedContent.push({ role: 'user', parts: [{ text: currentInput }] });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: mergedContent,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      const aiText = response.text || 'عذراً، حدث خطأ ما في معالجة طلبك.';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        senderId: 'ai',
        senderName: 'Assistant',
        createdAt: new Date()
      };

      // Save AI response to Firebase
      await saveAssistantMessage(user.uid, aiMsg);

    } catch (error) {
      console.error('Assistant Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 relative">
            <Sparkles size={28} strokeWidth={2.5} />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0f1214] rounded-full flex items-center justify-center p-1 border border-[#2d3748]">
              <div className="w-full h-full bg-[#10b981] rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#f8fafc] tracking-tight">المساعد الذكي</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#10b981] font-black uppercase tracking-widest bg-[#10b981]/10 px-2 py-0.5 rounded-md">مدعوم بـ AI</span>
              <span className="text-[9px] text-[#94a3b8] font-bold">متصل الآن</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-3 bg-[#1a1f24] rounded-2xl text-[#94a3b8] border border-[#2d3748] hover:text-red-500 transition-all active:scale-90"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-none pb-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 px-6 bg-gradient-to-br from-[#1a1f24] to-[#111827] rounded-[32px] border border-[#2d3748] text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 blur-3xl rounded-full" />
              <div className="flex justify-center gap-4">
                {[Zap, Shield, Heart].map((Icon, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-[#0f1214] flex items-center justify-center text-[#10b981] border border-[#2d3748]">
                    <Icon size={24} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#f8fafc]">كيف يمكنني إلهامك اليوم؟</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed max-w-xs mx-auto">أنا هنا لأساعدك في تنظيم مهامك، ذكر الله، وتطوير عاداتك الإسلامية.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['اقترح جدولاً ليومي', 'أذكار الصباح', 'كيف أنضم لمجموعة؟'].map((hint, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(hint)}
                    className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-4 py-2 rounded-full border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-all"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: message.senderId === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-4",
                message.senderId === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                message.senderId === 'ai' 
                  ? "bg-[#1a1f24] border-[#2d3748] text-[#10b981]" 
                  : "bg-[#10b981] border-[#10b981] text-white shadow-emerald-500/20"
              )}>
                {message.senderId === 'ai' ? <Sparkles size={20} /> : <User size={20} />}
              </div>
              <div className={cn(
                "max-w-[80%] p-5 rounded-[24px] text-sm leading-relaxed shadow-sm",
                message.senderId === 'ai' 
                  ? "bg-[#1a1f24] text-[#f8fafc] border border-[#2d3748] rounded-tr-none" 
                  : "bg-emerald-500 text-white rounded-tl-none font-medium"
              )}>
                {message.text}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1a1f24] border border-[#2d3748] flex items-center justify-center text-[#10b981]">
                <Sparkles size={20} className="animate-spin" />
              </div>
              <div className="bg-[#1a1f24] p-4 rounded-[20px] rounded-tr-none border border-[#2d3748] flex gap-2">
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Field */}
      <div className="mt-6 px-1">
        <div className="relative group">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اسأل المساعد الذكي..."
            className="w-full bg-[#1a1f24] border border-[#2d3748] rounded-[28px] py-5 pr-6 pl-20 text-sm text-[#f8fafc] focus:outline-none focus:border-[#10b981]/40 transition-all placeholder:text-[#94a3b8]/40 resize-none min-h-[60px] max-h-[150px] scrollbar-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all shadow-xl",
              input.trim() && !isLoading
                ? "bg-[#10b981] text-white shadow-emerald-500/30 scale-100"
                : "bg-[#1a1f24] text-[#2d3748] scale-90"
            )}
          >
            <Send size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
