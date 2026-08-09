"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Zəhmət olmasa parolu daxil edin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin/gallery");
        router.refresh();
      } else {
        setError(data.error || "Yanlış parol! Yoxlayıb yenidən cəhd edin.");
      }
    } catch (err) {
      setError("Serverlə əlaqə qurularkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 shadow-2xl border border-amber-500/20">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-inner mx-auto">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>

          <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Admin Idarəetmə Paneli
          </span>

          <h1 className="text-3xl font-serif-wedding gold-gradient-text font-bold">
            Giriş Edin
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm">
            Toy sahibi olaraq şəkillərə baxmaq və ZIP yükləmək üçün parolu daxil edin.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="adminPassword"
              className="block text-xs font-semibold text-amber-200/90 tracking-wide uppercase"
            >
              Admin Parolu <span className="text-rose-400">*</span>
            </label>

            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 w-5 h-5 text-amber-400/60 pointer-events-none" />
              <input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-slate-900/80 border border-amber-500/30 rounded-2xl py-3.5 pl-12 pr-12 text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium pt-1 animate-fade-in">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-button py-4 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Daxil Ol</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
