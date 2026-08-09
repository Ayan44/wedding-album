"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorStepProps {
  errorMessage: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function ErrorStep({
  errorMessage,
  onRetry,
  onBack,
}: ErrorStepProps) {
  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 text-center shadow-2xl border border-rose-500/30 animate-fade-in">
      {/* Error Badge */}
      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
        <AlertTriangle className="w-8 h-8" />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-serif-wedding text-rose-200 font-bold">
          Yükləmə Uğursuz Oldu
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm bg-rose-950/40 p-3 rounded-xl border border-rose-500/20 leading-relaxed text-rose-200">
          {errorMessage || "İnternet kəsilməsi və ya naməlum xəta baş verdi."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={onRetry}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Yenidən Cəhd Et</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri Qayıt</span>
        </button>
      </div>
    </div>
  );
}
