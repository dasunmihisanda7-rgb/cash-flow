"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#9810FA]/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#3B82F6]/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0A0E17]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1 
            className="text-4xl font-black italic tracking-[-2px] uppercase text-white mb-2"
            layoutId="title"
          >
            CASH<span className="text-[#9810FA]">FLOW</span>
          </motion.h1>
          <p className="text-[9px] tracking-[5px] text-slate-500 uppercase font-black italic">
            SECURE CLOUD DASHBOARD
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#9810FA]/50 focus:ring-1 focus:ring-[#9810FA]/20 rounded-3xl py-5 pl-[60px] pr-6 text-white outline-none transition-all placeholder-slate-700 font-bold italic"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#9810FA]/50 focus:ring-1 focus:ring-[#9810FA]/20 rounded-3xl py-5 pl-[60px] pr-6 text-white outline-none transition-all placeholder-slate-700 font-bold italic"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-rose-500 text-[10px] font-black italic uppercase tracking-wider bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-emerald-500 text-[10px] font-black italic uppercase tracking-wider bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20"
              >
                <LogIn size={14} className="shrink-0" />
                <span>{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl text-white font-black text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'login' ? 'bg-[#9810FA]' : 'bg-slate-800'
            }`}
          >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
             {isLoading ? (
               <Loader2 className="animate-spin mx-auto" size={20} />
             ) : (
               mode === 'login' ? "ENTER DASHBOARD" : "CREATE ACCOUNT"
             )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setMessage(null);
              }}
              className="text-[10px] font-black italic tracking-widest text-slate-500 hover:text-white transition-colors uppercase"
            >
              {mode === 'login' ? "Don't have an account? Create one" : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
