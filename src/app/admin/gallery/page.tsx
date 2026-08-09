"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Image as ImageIcon,
  Calendar,
  User,
  MessageSquare,
  RefreshCw,
  Heart,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Archive,
  Trash2,
} from "lucide-react";

export interface PhotoItem {
  public_id: string;
  secure_url: string;
  created_at: string;
  format: string;
  guestName: string;
  message: string;
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchPhotos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/photos");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      if (res.ok && data.photos) {
        setPhotos(data.photos);
      } else {
        setError(data.error || "Şəkilləri yükləmək mümkün olmadı.");
      }
    } catch {
      setError("Serverlə əlaqə kəsildi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((prev) =>
          prev !== null ? Math.min(prev + 1, filteredPhotos.length - 1) : null
        );
      if (e.key === "ArrowLeft")
        setLightboxIndex((prev) =>
          prev !== null ? Math.max(prev - 1, 0) : null
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lightboxIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/admin");
    router.refresh();
  };

  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      const res = await fetch("/api/admin/download-zip");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      if (res.ok && data.zipUrl) {
        window.open(data.zipUrl, "_blank");
      } else {
        alert(data.error || "ZIP yaradılarkən xəta baş verdi.");
      }
    } catch {
      alert("Serverlə əlaqə kəsildi.");
    } finally {
      setZipLoading(false);
    }
  };

  const handleDeletePhoto = async (
    e: React.MouseEvent,
    publicId: string
  ) => {
    e.stopPropagation(); // prevent opening lightbox
    const confirmed = window.confirm(
      "Bu şəkli silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
    );
    if (!confirmed) return;

    setDeletingId(publicId);
    try {
      const res = await fetch(
        `/api/admin/photos/${encodeURIComponent(publicId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        // Optimistically remove from state
        setPhotos((prev) => prev.filter((p) => p.public_id !== publicId));
        // If lightbox was showing this photo, close it
        setLightboxIndex(null);
      } else {
        const data = await res.json();
        alert(data.error || "Şəkil silinərkən xəta baş verdi.");
      }
    } catch {
      alert("Serverlə əlaqə kəsildi.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    try {
      return new Intl.DateTimeFormat("az-AZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  // Filter photos by guest name search query
  const filteredPhotos = photos.filter((p) =>
    p.guestName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* ── Header ── */}
        <header className="glass-card rounded-3xl p-4 sm:p-6 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Heart className="w-6 h-6 fill-amber-400/20 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif-wedding gold-gradient-text font-bold">
                  Toy Şəkilləri Qalereyası
                </h1>
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {filteredPhotos.length}/{photos.length}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Qonaqlar tərəfindən yüklənən şəkillər • Ən yenilər yuxarıda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={fetchPhotos}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
              title="Yenilə"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {photos.length > 0 && (
              <button
                onClick={handleDownloadZip}
                disabled={zipLoading || loading}
                className="px-4 py-2.5 rounded-xl gold-button text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                title="Hamısını ZIP kimi yüklə"
              >
                {zipLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                <span>{zipLoading ? "Hazırlanır…" : "ZIP Yüklə"}</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıxış</span>
            </button>
          </div>
        </header>

        {/* ── Search / Filter Bar ── */}
        {!loading && photos.length > 0 && (
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-amber-400/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qonaq adı ilə axtarın…"
              className="w-full bg-slate-900/80 border border-amber-500/25 rounded-2xl py-3 pl-12 pr-10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-slate-400 hover:text-amber-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Şəkillər yüklənir…</p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto border border-rose-500/30">
            <p className="text-rose-300 text-sm">{error}</p>
            <button onClick={fetchPhotos} className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold">
              Yenidən Cəhd Et
            </button>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto border border-amber-500/20">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400/60">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">
              {searchQuery ? `"${searchQuery}" ilə uyğun şəkil tapılmadı` : "Hələ heç bir şəkil yüklənməyib"}
            </h3>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-amber-400 text-xs underline cursor-pointer">
                Filtri sil
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.public_id}
                className="glass-card rounded-2xl overflow-hidden border border-amber-500/15 hover:border-amber-500/40 transition-all duration-300 group flex flex-col bg-slate-900/60 relative"
              >
                {/* Thumbnail — clicking opens lightbox */}
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-slate-950 cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.secure_url}
                    alt={`${photo.guestName} tərəfindən şəkil`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                    <span className="text-xs text-amber-200 font-medium bg-slate-950/70 px-3 py-1 rounded-full">
                      Böyüt
                    </span>
                  </div>
                </div>

                {/* Delete button — top-right corner, visible on hover */}
                <button
                  onClick={(e) => handleDeletePhoto(e, photo.public_id)}
                  disabled={deletingId === photo.public_id}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-950/80 border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10 disabled:opacity-50"
                  title="Şəkli sil"
                >
                  {deletingId === photo.public_id ? (
                    <div className="w-3.5 h-3.5 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-300 text-sm font-semibold">
                      <User className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{photo.guestName}</span>
                    </div>
                    {photo.message && (
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/10 flex items-start gap-2 text-xs text-slate-300">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                        <p className="italic line-clamp-3">"{photo.message}"</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{formatDate(photo.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      {lightboxPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i !== null ? i - 1 : null));
              }}
              className="absolute left-4 w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center justify-center cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next */}
          {lightboxIndex < filteredPhotos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i !== null ? i + 1 : null));
              }}
              className="absolute right-4 w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center justify-center cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Image + Info */}
          <div
            className="max-w-4xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto.secure_url}
              alt={`${lightboxPhoto.guestName} tərəfindən şəkil`}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl border border-amber-500/20"
            />

            {/* Info strip */}
            <div className="glass-card rounded-2xl px-5 py-3 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 w-full max-w-xl">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                <User className="w-4 h-4" />
                <span>{lightboxPhoto.guestName}</span>
              </div>

              {lightboxPhoto.message && (
                <p className="text-slate-300 text-xs italic flex-1 text-center">
                  "{lightboxPhoto.message}"
                </p>
              )}

              <a
                href={lightboxPhoto.secure_url}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                title="Endiri"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>

            <p className="text-slate-500 text-xs">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
