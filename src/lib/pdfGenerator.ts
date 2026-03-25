import { jsPDF, jsPDFOptions } from 'jspdf';

export type PageItem = {
  id: string;
  originalName: string;
  blobUrl: string;
  detectedOrientation: 'portrait' | 'landscape';
  userConfirmedOrientation: 'portrait' | 'landscape' | null;
  width: number;
  height: number;
};

// Generate a random 12-char alphanumeric password
function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function generatePdf(images: PageItem[], options?: { protect?: boolean }): Promise<string | null> {
  const protect = options?.protect ?? false;
  const password = protect ? generatePassword() : null;
  
  if (images.length === 0) return password;

  // The first page uses the orientation of the first image
  const firstOrientation = images[0].userConfirmedOrientation || images[0].detectedOrientation;

  const pdfConfig: jsPDFOptions = {
    orientation: firstOrientation,
    format: 'a4',
  };

  if (protect && password) {
    pdfConfig.encryption = {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ['print']
    };
  }

  const pdf = new jsPDF(pdfConfig);

  const A4_DIMENSIONS = {
    portrait: { width: 210, height: 297 },
    landscape: { width: 297, height: 210 }
  };

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const orientation = img.userConfirmedOrientation || img.detectedOrientation;
    
    if (i > 0) {
      pdf.addPage('a4', orientation);
    }
    
    pdf.setPage(i + 1);
    
    const a4 = A4_DIMENSIONS[orientation];
    
    const scaleWidth = a4.width / img.width;
    const scaleHeight = a4.height / img.height;
    
    const scale = Math.min(scaleWidth, scaleHeight);
    
    const finalWidth = img.width * scale;
    const finalHeight = img.height * scale;
    
    const xOffset = (a4.width - finalWidth) / 2;
    const yOffset = (a4.height - finalHeight) / 2;
    
    const format = img.originalName.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';

    pdf.addImage(img.blobUrl, format, xOffset, yOffset, finalWidth, finalHeight);
  }

  // pdf.save('Secure_Document.pdf');
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Secure_Document.pdf';
  document.body.appendChild(link);
  link.click();
  
  // Delay cleanup to ensure browser initiates download
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 2000);

  return password;
}
