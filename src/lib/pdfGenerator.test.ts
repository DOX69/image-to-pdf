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
  const mockImages = [
    { id: '1', blobUrl: 'fake-url-1', originalName: 'Page1.jpg', detectedOrientation: 'portrait' as const, userConfirmedOrientation: 'portrait' as const, width: 800, height: 1200 },
    { id: '2', blobUrl: 'fake-url-2', originalName: 'Page2.jpg', detectedOrientation: 'landscape' as const, userConfirmedOrientation: 'landscape' as const, width: 1200, height: 800 }
  ];

  it('generates a PDF without a password by default', async () => {
    vi.clearAllMocks();
    
    const password = await generatePdf(mockImages);
    
    expect(password).toBeNull();

    // Verify jsPDF constructor was called WITHOUT encryption
    expect(jsPDF).toHaveBeenCalledWith(expect.not.objectContaining({
      encryption: expect.anything()
    }));

    const mockInstance = (jsPDF as unknown as { mock: { results: { value: { addImage: unknown, addPage: unknown, output: unknown } }[] } }).mock.results[0].value;
    expect(mockInstance.addImage).toHaveBeenCalledTimes(2);
    expect(mockInstance.addPage).toHaveBeenCalledTimes(1);
    expect(mockInstance.output).toHaveBeenCalledWith('blob');
  });

  it('generates a PDF with a random password when protect is true', async () => {
    vi.clearAllMocks();
    
    const password = await generatePdf(mockImages, { protect: true });
    
    expect(password).toHaveLength(12);

    // Verify jsPDF constructor was called WITH encryption
    expect(jsPDF).toHaveBeenCalledWith(expect.objectContaining({
      format: 'a4',
      encryption: expect.objectContaining({
        userPassword: password,
        ownerPassword: password
      })
    }));
  });
});
