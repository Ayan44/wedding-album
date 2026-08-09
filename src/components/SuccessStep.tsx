"use client";

import React from "react";
import { Sparkles, PlusCircle, CheckCircle2, Heart } from "lucide-react";

interface SuccessStepProps {
  guestName: string;
  uploadedCount: number;
  onAddMorePhotos: () => void;
}

export default function SuccessStep({
  guestName,
  uploadedCount,
  onAddMorePhotos,
}: SuccessStepProps) {
  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 text-center shadow-2xl border border-amber-500/30 animate-fade-in">
      {/* Success Badge Icon */}
      <div className="relative inline-block mx-auto">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-300/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-amber-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
          <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
        </div>
      </div>

      {/* Main Thank You Message */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Uğurla Yükləndi <Sparkles className="w-3.5 h-3.5" />
        </span>

        <h2 className="text-3xl font-serif-wedding gold-gradient-text font-bold">
          Təşəkkürlər! 🎉
        </h2>

        <p className="text-slate-200 text-sm leading-relaxed max-w-xs mx-auto">
          Əziz <strong className="text-amber-200">{guestName}</strong>, göndərdiyiniz{" "}
          <strong className="text-amber-300 font-bold">{uploadedCount} şəkil</strong> toy albomuna əlavə olundu. Bu gözəl xatirəni bizim ilə böldüyünüz üçün təşəkkür edirik!
        </p>
      </div>

      {/* Action Button: Add More Photos */}
      <div className="pt-4 border-t border-amber-500/20 space-y-3">
        <button
          type="button"
          onClick={onAddMorePhotos}
          className="w-full gold-button py-4 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-lg cursor-pointer group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Daha Şəkil Əlavə Et</span>
        </button>

        <p className="text-[11px] text-slate-400">
          İstədiyiniz zaman daha çox şəkil və ya videoxatirə yükləyə bilərsiniz.
        </p>
      </div>
    </div>
  );
}
