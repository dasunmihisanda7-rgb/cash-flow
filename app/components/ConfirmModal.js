// components/ConfirmModal.js
"use client";

export default function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">

            {/* Container - Glass Effect with soft glow */}
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#161b27]/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/20">

                {/* Icon & Title */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v2.25m6.75 0h-13.5" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-black italic tracking-widest text-white uppercase">SYSTEM OVERRIDE</h3>
                    <p className="mt-2 text-xs font-bold italic tracking-widest text-slate-400 uppercase leading-relaxed">
                        {message || "Confirm permanent deletion of this record from the system?"}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-3.5 text-[10px] font-black italic tracking-widest text-slate-400 uppercase transition-all duration-300 hover:bg-white/10 hover:text-white"
                    >
                        ABORT
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-2xl bg-rose-600/20 border border-rose-500/50 py-3.5 text-[10px] font-black italic tracking-widest text-rose-400 uppercase transition-all duration-300 hover:bg-rose-600/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                    >
                        DELETE
                    </button>
                </div>

            </div>
        </div>
    );
}