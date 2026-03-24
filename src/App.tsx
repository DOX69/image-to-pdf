import { useState, useEffect } from 'react';
import { DropzoneArea } from './components/DropzoneArea';
import { SortableGrid } from './components/SortableGrid';
import { ActionPanel } from './components/ActionPanel';
import { PasswordModal } from './components/PasswordModal';
import { generatePdf } from './lib/pdfGenerator';
import type { PageItem } from './lib/pdfGenerator';
import { sortFilesNumerically } from './lib/sortLogic';
import './index.css';

function App() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.blobUrl));
    };
  }, []);

  const handleFilesAdded = async (files: File[]) => {
    const sorted = sortFilesNumerically(files);
    
    // We need to load image dimensions to auto-detect orientation
    const newPages: PageItem[] = await Promise.all(
      sorted.map((file) => {
        return new Promise<PageItem>((resolve) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const detectedOrientation = img.width > img.height ? 'landscape' : 'portrait';
            resolve({
              id: crypto.randomUUID(),
              originalName: file.name,
              blobUrl: url,
              detectedOrientation,
              userConfirmedOrientation: null,
              width: img.width,
              height: img.height,
            });
          };
          img.src = url;
        });
      })
    );

    setPages((prev) => [...prev, ...newPages]);
  };

  const handleRemove = (id: string) => {
    setPages((prev) => {
      const pageToRemove = prev.find((p) => p.id === id);
      if (pageToRemove) URL.revokeObjectURL(pageToRemove.blobUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleToggleOrientation = (id: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const current = p.userConfirmedOrientation || p.detectedOrientation;
          return {
            ...p,
            userConfirmedOrientation: current === 'portrait' ? 'landscape' : 'portrait',
          };
        }
        return p;
      })
    );
  };

  const handleClear = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.blobUrl));
    setPages([]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedPassword = await generatePdf(pages);
      setPassword(generatedPassword);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Generation failed. See console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1>Image to Secure PDF</h1>
        <p>Drop images or ZIP archives. Sort them. Generate a pixel-perfect A4 PDF.</p>
      </header>

      <DropzoneArea onFilesAdded={handleFilesAdded} />

      {pages.length > 0 && (
        <>
          <SortableGrid
            items={pages}
            setItems={setPages}
            onRemove={handleRemove}
            onToggleOrientation={handleToggleOrientation}
          />
          <ActionPanel
            onClear={handleClear}
            onGenerate={handleGenerate}
            canGenerate={pages.length > 0}
            isGenerating={isGenerating}
          />
        </>
      )}

      <PasswordModal password={password} onClose={() => setPassword(null)} />
    </main>
  );
}

export default App;
