import { describe, it, expect } from 'vitest';
import { extractImagesFromZip } from './zipHandler';
import JSZip from 'jszip';

describe('zipHandler', () => {
  it('extracts only png and jpg files from a zip archive', async () => {
    const zip = new JSZip();
    zip.file('Page1.png', 'fake-image-data1');
    zip.file('document.txt', 'hello world text content');
    zip.file('Page2.jpg', 'fake-image-data2');
    zip.file('folder/Page3.jpeg', 'fake-image-data3');

    // Create a Blob representing the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const file = new File([content], 'test.zip', { type: 'application/zip' });

    const extractedFiles = await extractImagesFromZip(file);

    expect(extractedFiles.length).toBe(3);
    const names = extractedFiles.map(f => f.name).sort();
    expect(names).toEqual(['Page1.png', 'Page2.jpg', 'Page3.jpeg']);
  });
});
