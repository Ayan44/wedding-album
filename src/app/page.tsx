"use client";

import React, { useState, useEffect } from "react";
import NameEntryStep from "@/components/NameEntryStep";
import PhotoUploadStep from "@/components/PhotoUploadStep";
import SuccessStep from "@/components/SuccessStep";
import ErrorStep from "@/components/ErrorStep";
import { getStoredGuestName, setStoredGuestName, clearStoredGuestName } from "@/lib/storage";
import { uploadMultipleImagesToCloudinary } from "@/lib/upload";
import { User, LogOut } from "lucide-react";

export default function Home() {
  const [guestName, setGuestName] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);
  const [lastSelectedFiles, setLastSelectedFiles] = useState<File[]>([]);
  const [lastSelectedMessage, setLastSelectedMessage] = useState<string>("");

  useEffect(() => {
    const saved = getStoredGuestName();
    if (saved) {
      setGuestName(saved);
    }
    setIsLoaded(true);
  }, []);

  const handleNameSubmit = (name: string) => {
    setStoredGuestName(name);
    setGuestName(name);
  };

  const handleResetName = () => {
    clearStoredGuestName();
    setGuestName("");
    setUploadedCount(null);
    setUploadError(null);
  };

  const handleUploadSubmit = async (files: File[], message: string) => {
    setLastSelectedFiles(files);
    setLastSelectedMessage(message);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const results = await uploadMultipleImagesToCloudinary(files, {
        guestName,
        message,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      console.log("Uploaded successfully to Cloudinary:", results);
      setUploadedCount(results.length);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Şəkillər yüklənərkən xəta baş verdi.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryUpload = () => {
    if (lastSelectedFiles.length > 0) {
      handleUploadSubmit(lastSelectedFiles, lastSelectedMessage);
    } else {
      setUploadError(null);
    }
  };

  const handleAddMorePhotos = () => {
    setUploadedCount(null);
    setUploadError(null);
    setUploadProgress(0);
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden py-8">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {!guestName ? (
        <NameEntryStep onSubmitName={handleNameSubmit} />
      ) : uploadError ? (
        <ErrorStep
          errorMessage={uploadError}
          onRetry={handleRetryUpload}
          onBack={handleAddMorePhotos}
        />
      ) : uploadedCount !== null ? (
        <SuccessStep
          guestName={guestName}
          uploadedCount={uploadedCount}
          onAddMorePhotos={handleAddMorePhotos}
        />
      ) : (
        <div className="w-full max-w-lg space-y-4 relative z-10">
          {/* Top Bar with Guest Name */}
          <div className="glass-card rounded-2xl p-3 px-5 flex items-center justify-between border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-semibold">
              <User className="w-4 h-4 text-amber-400" />
              <span>Qonaq: <strong className="text-slate-100">{guestName}</strong></span>
            </div>
            <button
              onClick={handleResetName}
              title="Adı dəyiş"
              className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Adı dəyiş</span>
            </button>
          </div>

          {/* Photo Upload Step Component */}
          <PhotoUploadStep
            guestName={guestName}
            onUploadSubmit={handleUploadSubmit}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>
      )}
    </main>
  );
}





