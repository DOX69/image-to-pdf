import JSZip from 'jszip';

export async function extractImagesFromZip(file: File): Promise<File[]> {
  const zip = new JSZip();
  const arrayBuffer = await file.arrayBuffer();
  const loadedZip = await zip.loadAsync(arrayBuffer);
  const imageFiles: File[] = [];
  const promises: Promise<void>[] = [];

  loadedZip.forEach((_relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const lowerName = zipEntry.name.toLowerCase();
      if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        promises.push(
          zipEntry.async('blob').then((blob) => {
            const name = zipEntry.name.split('/').pop() || zipEntry.name;
            const extractedFile = new File([blob], name, { type: blob.type || getMimeType(lowerName) });
            imageFiles.push(extractedFile);
          })
        );
      }
    }
  });

  await Promise.all(promises);
  return imageFiles;
}

function getMimeType(name: string): string {
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}
