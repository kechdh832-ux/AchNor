import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Mail, Lock, User, Globe, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { syncUserProfile } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await syncUserProfile(res.user);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        await syncUserProfile(res.user);
      }
    } catch (err: any) {
      setError(err.message === 'Firebase: Error (auth/invalid-credential).' ? 'بيانات الدخول غير صحيحة' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1214] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%25] left-[-10%25] w-[50%25] h-[50%25] bg-[#10b981]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%25] right-[-10%25] w-[50%25] h-[50%25] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1000px] flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10"
      >
        {/* Left Side: Brand Visuals (Desktop only mostly) */}
        <div className="flex-1 text-center lg:text-right space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-block relative"
          >
            <div className="absolute inset-0 bg-[#10b981] blur-[40px] opacity-30 animate-pulse rounded-full" />
            <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-[40px] bg-[#1a1f24] border-2 border-[#10b981]/20 shadow-2xl flex items-center justify-center p-6 relative overflow-hidden group">
               <img 
                src="https://ais-pre-gqnrc73yv6lu6dtraibokd-125613358658.europe-west2.run.app/api/asset/7f6d2b63-0941-477f-a690-3cb83769c00b.png" 
                alt="ACHNOOR Logo" 
                className="w-full h-full object-contain brightness-110 group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
              ACH<span className="text-[#10b981]">NOOR</span>
            </h1>
            <p className="text-xl sm:text-2xl text-[#94a3b8] font-bold max-w-md mx-auto lg:mr-0 leading-relaxed">
              نظم حياتك، طهر قلبك، <span className="text-white">وارتقِ بروحك</span> في رحلة نحو الأفضل.
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mr-0 pt-6">
            {[
              { icon: ShieldCheck, label: 'أمان تام' },
              { icon: Zap, label: 'أداء سريع' },
              { icon: Sparkles, label: 'ذكاء متميز' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 bg-[#1a1f24]/40 rounded-2xl border border-[#2d3748]">
                <feature.icon className="text-[#10b981]" size={20} />
                <span className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1a1f24] p-8 sm:p-10 rounded-[40px] border border-[#2d3748] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl rounded-full" />
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  {isRegister ? 'إنشاء حساب جديد' : 'مرحباً بك مجدداً'}
                </h3>
                <p className="text-sm text-[#94a3b8] font-medium">ابدأ رحلتك الإيمانية والإنتاجية اليوم</p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <AnimatePresence mode="wait">
                  {isRegister && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                      <input 
                        type="text" 
                        placeholder="الاسم الكامل"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 pr-12 pl-4 text-sm text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all"
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                  <input 
                    type="email" 
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 pr-12 pl-4 text-sm text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                  <input 
                    type="password" 
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0f1214] border border-[#2d3748] rounded-2xl py-4 pr-12 pl-4 text-sm text-[#f8fafc] focus:outline-none focus:border-[#10b981] transition-all"
                    required
                  />
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs text-center font-bold px-2 pt-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#10b981] text-white py-4 mt-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'جاري التحميل...' : (isRegister ? 'استمرار' : 'تسجيل دخول')}
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2d3748]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#1a1f24] px-4 text-[#94a3b8] font-black tracking-[0.2em]">أو المتابعة عبر</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#0f1214] border border-[#2d3748] rounded-2xl text-[#f8fafc] text-sm font-bold hover:border-[#10b981]/30 transition-all active:scale-95"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5">
                   <Globe size={14} className="text-[#4285F4]" />
                </div>
                حساب Google
              </button>

              <p className="text-center text-sm text-[#94a3b8] font-medium pt-4">
                {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-[#10b981] mr-2 font-black hover:underline underline-offset-4"
                >
                  {isRegister ? 'سجل دخولك' : 'أنشئ حساباً مجانياً'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
