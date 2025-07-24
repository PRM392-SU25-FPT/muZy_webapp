"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { validateImageFile, compressImage } from "../utils/ImageUtils";

interface ImageUploadProps {
  value?: string;
  imageName?: string;
  onChange: (base64: string, fileName: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  maxWidth?: number;
  quality?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  imageName,
  onChange,
  onError,
  disabled = false,
  maxWidth = 800,
  quality = 0.8,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        onError(validation.error!);
        return;
      }

      setIsUploading(true);
      onError("");

      try {
        const compressedBase64 = await compressImage(file, maxWidth, quality);
        onChange(compressedBase64, file.name);
      } catch (error) {
        console.error("Error processing image:", error);
        onError("Lỗi khi xử lý hình ảnh");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onError, maxWidth, quality]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="image-input"
        disabled={disabled || isUploading}
      />

      <div
        className={`image-upload-area ${isDragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="image-preview">
            <img
              src={value || "/placeholder.svg"}
              alt="Preview"
              className="preview-image"
            />
            <div className="image-overlay">
              <button
                type="button"
                className="btn-change-image"
                onClick={handleClick}
                disabled={disabled || isUploading}
                title="Thay đổi hình ảnh"
              >
                {isUploading ? "⏳" : "📷"}
              </button>
              <button
                type="button"
                className="btn-remove-image"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                title="Xóa hình ảnh"
              >
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <div className="image-placeholder" onClick={handleClick}>
            {isUploading ? (
              <div className="uploading">
                <div className="spinner">⏳</div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <span>Nhấn hoặc kéo thả để chọn hình ảnh</span>
                <small>JPEG, PNG, GIF, WebP (tối đa 5MB)</small>
              </>
            )}
          </div>
        )}
      </div>

      {imageName && (
        <div className="image-info">
          <small>📎 {imageName}</small>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
