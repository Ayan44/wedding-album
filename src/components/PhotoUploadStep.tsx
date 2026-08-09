"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface SelectedFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface PhotoUploadStepProps {
  guestName: string;
  onUploadSubmit: (files: File[], message: string) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function PhotoUploadStep({
  onUploadSubmit,
  isUploading = false,
  uploadProgress = 0,
}: PhotoUploadStepProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedFileItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Live WebRTC Camera Modal State
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState("");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop camera tracks when modal is closed
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowLiveCamera(false);
    setCameraError("");
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Attach stream to video element when DOM element is mounted
  useEffect(() => {
    if (showLiveCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current
        .play()
        .catch((err) => console.warn("Video play error:", err));
    }
  }, [showLiveCamera, cameraStream]);

  // Start live stream
  const startLiveCamera = async (mode: "environment" | "user") => {
    setCameraError("");
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      setShowLiveCamera(true);
    } catch (err: unknown) {
      console.warn("getUserMedia failed or denied, falling back to native file input:", err);
      setShowLiveCamera(false);
      // Fallback to standard input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  // Flip camera (front <-> back)
  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  // Capture photo from live video stream onto offscreen canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If user facing, mirror image horizontally
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setSelectedItems((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            file,
            previewUrl: URL.createObjectURL(file),
          },
        ]);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError("");

    const newItems: SelectedFileItem[] = [];
    const maxFiles = 10;

    if (selectedItems.length + fileList.length > maxFiles) {
      setError(`Bir dəfəyə maksimum ${maxFiles} şəkil seçə bilərsiniz.`);
    }

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Yalnız şəkil faylları yüklənilə bilər.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError(`"${file.name}" faylı çox böyükdür (Maks: 20MB).`);
        return;
      }

      if (selectedItems.length + newItems.length < maxFiles) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    setSelectedItems((prev) => [...prev, ...newItems]);

    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError("Zəhmət olmasa ən azı bir şəkil çəkin və ya qalereyadan seçin.");
      return;
    }
    setError("");
    onUploadSubmit(
      selectedItems.map((item) => item.file),
      message.trim()
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-card rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 shadow-2xl border border-amber-500/20">
      {/* Fallback Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFilesAdded(e.target.files)}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesAdded(e.target.files)}
      />

      {/* Header Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif-wedding gold-gradient-text font-bold">
          Şəkillərinizi Əlavə Edin
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm">
          Toy zamanı çəkdiyiniz şəkilləri seçin və təbrik mesajınızla birlikdə göndərin.
        </p>
      </div>

      {/* Selection Trigger Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => startLiveCamera(facingMode)}
          disabled={isUploading}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all duration-200 cursor-pointer active:scale-95 space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-semibold text-xs sm:text-sm">Şəkil Çək</span>
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isUploading}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all duration-200 cursor-pointer active:scale-95 space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-300">
            <ImageIcon className="w-6 h-6" />
          </div>
          <span className="font-semibold text-xs sm:text-sm">Qalereyadan Seç</span>
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Items Preview Grid */}
      {selectedItems.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
              Seçilmiş Şəkillər ({selectedItems.length})
            </span>
            {selectedItems.length < 10 && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yenisini əlavə et</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-xl overflow-hidden group border border-amber-500/20 bg-slate-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt="Önizləmə"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400 hover:bg-slate-950 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Greeting Message Field */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="greetingMessage"
            className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Təbrik Mesajınız (Opsional)</span>
          </label>
          <span className="text-[10px] text-slate-400">{message.length}/200</span>
        </div>
        <textarea
          id="greetingMessage"
          rows={2}
          maxLength={200}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bəylə gəlinə özəl təbrik sözlərinizi yazın..."
          className="w-full bg-slate-900/80 border border-amber-500/20 rounded-2xl p-3 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
        />
      </div>

      {/* Submit Button & Progress */}
      <div className="pt-2 space-y-3">
        {isUploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span>Şəkillər yüklənir...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-amber-500/20">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-base shadow-lg transition-all duration-200 cursor-pointer ${
              selectedItems.length > 0
                ? "gold-button"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>
              {selectedItems.length > 0
                ? `${selectedItems.length} Şəkli Göndər`
                : "Şəkil Seçin"}
            </span>
          </button>
        )}
      </div>

      {/* ── Live In-App Camera Viewfinder Modal ── */}
      {showLiveCamera && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6">
          {/* Top Controls Bar */}
          <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
            <button
              onClick={stopCamera}
              className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
              Canlı Kamera
            </span>
            <button
              onClick={toggleFacingMode}
              className="w-10 h-10 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer"
              title="Kameranı dəyiş"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Video Stream Container */}
          <div className="relative w-full max-w-md aspect-[3/4] my-auto bg-black rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 flex items-center justify-center">
            {cameraError ? (
              <p className="text-rose-400 text-xs p-4 text-center">{cameraError}</p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === "user" ? "-scale-x-100" : ""
                }`}
              />
            )}
          </div>

          {/* Bottom Shutter Capture Button */}
          <div className="w-full max-w-md flex items-center justify-center pb-6 z-10">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-amber-400 p-1.5 flex items-center justify-center bg-slate-900/50 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-2xl"
              title="Şəkli Çək"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-inner" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
