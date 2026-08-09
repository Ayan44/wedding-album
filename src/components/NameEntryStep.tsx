"use client";

import React, { useState } from "react";
import { User, Sparkles, ArrowRight, Heart } from "lucide-react";

interface NameEntryStepProps {
  initialName?: string;
  onSubmitName: (name: string) => void;
}

export default function NameEntryStep({
  initialName = "",
  onSubmitName,
}: NameEntryStepProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Zəhmət olmasa Ad və Soyadınızı daxil edin.");
      return;
    }
    if (trimmed.length < 3) {
      setError("Adınız ən az 3 simvoldan ibarət olmalıdır.");
      return;
    }
    setError("");
    onSubmitName(trimmed);
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 shadow-2xl border border-amber-500/20">
      {/* Decorative Header Badge */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-inner">
          <Heart className="w-7 h-7 fill-amber-400/20 text-amber-400 animate-pulse" />
        </div>
        
        <span className="text-xs uppercase tracking-widest text-amber-300/80 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Toy Şəkil Albomu <Sparkles className="w-3.5 h-3.5" />
        </span>
        
        <h1 className="text-3xl font-serif-wedding gold-gradient-text font-bold tracking-tight">
          Xoş Gəlmisiniz!
        </h1>
        
        <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
          Toy zamanı çəkdiyiniz ən özəl şəkilləri bizimlə bölüşmək üçün adınızı qeyd edin.
        </p>
      </div>

      {/* Name Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="guestName"
            className="block text-xs font-semibold text-amber-200/90 tracking-wide uppercase"
          >
            Adınız və Soyadınız <span className="text-rose-400">*</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-4 w-5 h-5 text-amber-400/60 pointer-events-none" />
            <input
              id="guestName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Məsələn: Elvin Məmmədov"
              autoFocus
              className="w-full bg-slate-900/80 border border-amber-500/30 rounded-2xl py-3.5 pl-12 pr-4 text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-400 font-medium pt-1 animate-fade-in">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full gold-button py-4 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-lg cursor-pointer group"
        >
          <span>Davam Et</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-amber-500/10">
        <p className="text-xs text-slate-400">
          🔒 Adınız yalnız şəkillərinizin kim tərəfindən göndərildiyini göstərmək üçün istifadə olunur.
        </p>
      </div>
    </div>
  );
}
