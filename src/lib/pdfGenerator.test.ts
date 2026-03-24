/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { generatePdf } from './pdfGenerator';
import { jsPDF } from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn(function() {
      return {
        addImage: vi.fn(),
        addPage: vi.fn(),
        setPage: vi.fn(),
        save: vi.fn(),
        output: vi.fn(() => new Blob([])),
      };
    })
  };
});

describe('pdfGenerator', () => {
  it('generates a PDF with the correct number of pages and a random password', async () => {
    const images = [
      { id: '1', blobUrl: 'fake-url-1', originalName: 'Page1.jpg', detectedOrientation: 'portrait' as const, userConfirmedOrientation: 'portrait' as const, width: 800, height: 1200 },
      { id: '2', blobUrl: 'fake-url-2', originalName: 'Page2.jpg', detectedOrientation: 'landscape' as const, userConfirmedOrientation: 'landscape' as const, width: 1200, height: 800 }
    ];

    const password = await generatePdf(images);
    
    expect(password).toHaveLength(12);

    // Verify jsPDF constructor was called with encryption
    expect(jsPDF).toHaveBeenCalledWith(expect.objectContaining({
      format: 'a4',
      encryption: expect.objectContaining({
        userPassword: password,
        ownerPassword: password
      })
    }));

    const mockInstance = (jsPDF as any).mock.results[0].value;
    
    // 2 images = 2 addImage calls
    expect(mockInstance.addImage).toHaveBeenCalledTimes(2);
    // 2 images = 1 addPage call (only between pages)
    expect(mockInstance.addPage).toHaveBeenCalledTimes(1);
    expect(mockInstance.output).toHaveBeenCalledWith('blob');
  });
});
