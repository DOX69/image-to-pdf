import React, { useCallback } from 'react';
import { extractImagesFromZip } from '../lib/zipHandler';

interface DropzoneAreaProps {
  onFilesAdded: (files: File[]) => void;
}

export function DropzoneArea({ onFilesAdded }: DropzoneAreaProps) {
  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const items = Array.from(e.dataTransfer.files);
      const outputFiles: File[] = [];

      for (const file of items) {
        if (file.name.endsWith('.zip')) {
          const extracted = await extractImagesFromZip(file);
          outputFiles.push(...extracted);
        } else if (file.type.startsWith('image/')) {
          outputFiles.push(file);
        }
      }
      onFilesAdded(outputFiles);
      
      // Reset input value just in case
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [onFilesAdded]
  );

  const onInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const outputFiles: File[] = [];
      for (const file of files) {
        if (file.name.endsWith('.zip')) {
          const extracted = await extractImagesFromZip(file);
          outputFiles.push(...extracted);
        } else if (file.type.startsWith('image/')) {
          outputFiles.push(file);
        }
      }
      onFilesAdded(outputFiles);
      
      // CRITICAL FIX: Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
      className="dropzone"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChanged}
        style={{ display: 'none' }}
        multiple
        accept="image/*,.zip"
      />
      <p>Click or Drag & Drop ZIP or Images</p>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
        secure, client-side processing
      </span>
    </div>
  );
}
