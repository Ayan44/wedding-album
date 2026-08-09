"use client";

import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Plus, X, Upload, MessageSquare, AlertCircle } from "lucide-react";

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
  guestName,
  onUploadSubmit,
  isUploading = false,
  uploadProgress = 0,
}: PhotoUploadStepProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedFileItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError("");

    const newItems: SelectedFileItem[] = [];
    const maxFiles = 10; // limit per batch

    if (selectedItems.length + fileList.length > maxFiles) {
      setError(`Bir dəfəyə maksimum ${maxFiles} şəkil seçə bilərsiniz.`);
    }

    Array.from(fileList).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Yalnız şəkil faylları yüklənilə bilər.");
        return;
      }
      // Validate file size (max 20MB)
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

    // Reset input values so same file can be re-selected if needed
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
      {/* Hidden File Inputs */}
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
          onClick={() => cameraInputRef.current?.click()}
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
                {/* eslint-disable-next-html-element-suppression */}
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
    </div>
  );
}
