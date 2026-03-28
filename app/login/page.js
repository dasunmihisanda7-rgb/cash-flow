"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isShaking, setIsShaking] = useState(false); // Vibration effect එකට
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // පරණ error අයින් කරන්න

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err) {
            // ලොගින් වැරදුණාම මේ ටික වෙන්නේ:
            setError("ACCESS DENIED: INVALID CREDENTIALS");
            setIsShaking(true);

            // තත්පර භාගයකින් Shake එක නතර කරන්න (ආයෙත් වැරදුණොත් Shake වෙන්න ඕන නිසා)
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0f1a] p-6 text-white font-sans">

            {/* Shake Effect එක සඳහා CSS Inline Styles */}
            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          border-color: rgba(244, 63, 94, 0.5) !important;
          box-shadow: 0 0 30px rgba(244, 63, 94, 0.2);
        }
      `}</style>

            <div className={`w-full max-w-md rounded-[40px] border border-white/5 bg-[#161b27]/40 p-10 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${isShaking ? "animate-shake" : ""}`}>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black italic tracking-[0.25em] uppercase text-white">
                        CASH<span className="text-fuchsia-500">FLOW</span>
                    </h1>
                    <p className="mt-2 text-[10px] font-black italic tracking-[0.4em] text-slate-500 uppercase">
                        Secure Terminal Login
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black italic tracking-widest text-slate-500 uppercase">User Identity</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="EMAIL ADDRESS..."
                            className="w-full rounded-2xl border border-white/5 bg-black/40 px-6 py-4 text-xs font-bold italic tracking-widest text-white outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black italic tracking-widest text-slate-500 uppercase">Access Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="PASSWORD..."
                            className="w-full rounded-2xl border border-white/5 bg-black/40 px-6 py-4 text-xs font-bold italic tracking-widest text-white outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    {/* ── ERROR MESSAGE WITH LOCK ICON ── */}
                    {error && (
                        <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-500 animate-in fade-in slide-in-from-top-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] font-black italic tracking-[0.15em] uppercase">{error}</span>
                        </div>
                    )}

                    <button type="submit" className="group relative w-full overflow-hidden rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/50 py-4 transition-all hover:bg-fuchsia-600/30">
                        <span className="relative z-10 text-[11px] font-black italic tracking-[0.3em] text-white uppercase group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                            Authorize Access
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}