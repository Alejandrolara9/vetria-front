"use client";

import { useRef, useState } from "react";

interface PetPhotoAvatarProps {
  petId: string;
  photoUrl: string | null;
  fallbackEmoji: string;
  uploadFn: (file: File) => Promise<string>;
  onUploaded: (newUrl: string) => void;
}

export function PetPhotoAvatar({
  photoUrl,
  fallbackEmoji,
  uploadFn,
  onUploaded,
}: PetPhotoAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(photoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const newUrl = await uploadFn(file);
      setCurrentUrl(newUrl);
      onUploaded(newUrl);
    } catch (err) {
      setError((err as Error).message ?? "Error al subir la foto");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative w-20 h-20 rounded-2xl overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Cambiar foto de mascota"
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Foto de mascota"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-4xl select-none">
            {fallbackEmoji}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-white text-lg">📷</span>
              <span className="text-white text-[10px] font-medium mt-0.5">Cambiar foto</span>
            </>
          )}
        </div>
      </button>

      {error && (
        <p className="text-xs text-destructive max-w-[80px] leading-tight">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={uploading}
        onChange={handleFileChange}
      />
    </div>
  );
}
