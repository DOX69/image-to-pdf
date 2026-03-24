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
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
      className="dropzone"
      style={{
        border: '2px dashed #ccc',
        borderRadius: '12px',
        padding: '60px',
        textAlign: 'center',
        margin: '20px 0',
        cursor: 'pointer',
        background: '#fafafa',
        transition: 'background 0.2s',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChanged}
        style={{ display: 'none' }}
        multiple
        accept="image/*,.zip"
      />
      <h2 style={{ margin: 0, fontWeight: 500, color: '#333' }}>
        Click or Drag & Drop ZIP or Images
      </h2>
      <p style={{ color: '#666', marginTop: '10px' }}>
        ZIP archives will be automatically extracted.
      </p>
    </div>
  );
}
