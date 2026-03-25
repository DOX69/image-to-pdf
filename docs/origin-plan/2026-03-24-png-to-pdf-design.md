# PNG to PDF Web App Design

## Overview
A lightweight, client-side web application designed to convert multiple PNG/JPG images (provided individually or via a ZIP file) into a single ordered PDF file.

## Technical Approach
- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** CSS Modules / Vanilla CSS for a premium look
- **Libraries:**
  - `jszip`: For extracting images from uploaded `.zip` files
  - `jspdf`: For generating the final `.pdf` document
  - `@dnd-kit/core` & `@dnd-kit/sortable`: For drag-and-drop reordering

## Architecture & Project Structure
```text
png-to-pdf/
├── src/
│   ├── components/
│   │   ├── DropzoneArea.tsx  # Handles file and zip uploads
│   │   ├── SortableGrid.tsx  # Drag and drop reordering of images
│   │   └── ActionPanel.tsx   # Controls (Generate PDF, Clear)
│   ├── lib/
│   │   ├── zipHandler.ts     # JSZip logic to extract images
│   │   └── pdfGenerator.ts   # jsPDF logic to create the document
│   ├── tests/                # TDD spec files
│   ├── App.tsx               # Main application state and layout
│   └── main.tsx
├── package.json
└── vite.config.ts
```

## Data Flow
1. **Input:** User drops a `.zip` file or multiple `.png`/`.jpg` files onto `DropzoneArea`.
2. **Extraction:**
   - If ZIP: `zipHandler.ts` extracts the images using `jszip`.
   - If direct files: The browser's File API reads them.
3. **State Management:** Files are converted to local Blob URLs and stored in the React state: `Array<{ id: string, name: string, url: string }>`.
4. **Sorting:** The array defaults to numerical sorting based on the `name` property (e.g., `Page1.jpg` -> `Page2.jpg` ... `Page10.jpg`).
5. **Reordering:** The user can visually reorder the images using the `SortableGrid` (powered by `dnd-kit`).
6. **Generation:** The user clicks "Generate PDF" in the `ActionPanel`. `pdfGenerator.ts` processes the images in the exact order shown on screen and triggers a browser download using `jspdf`.

## TDD Strategy (Red-Green-Refactor)
Features will be implemented behavior-first using Vitest:
- **`zipHandler.test.ts`**: Verify zip extraction returns only valid image types.
- **`sortLogic.test.ts`**: Verify that `Page10` is correctly sorted *after* `Page2`, not before.
- **`pdfGenerator.test.ts`**: Verify PDF object creation from mock image blobs.
- **Component Tests**: Verify the dropzone accepts correct MIME types and rejections.
