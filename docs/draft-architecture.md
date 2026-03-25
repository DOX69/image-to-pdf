# Software Architecture Document (SAD): PNG to PDF Web App

## 1. System Landscape
The application operates entirely within the browser context. There is no backend service, no database, and no server-side rendering required for the core conversion loop.

- **Client:** Modern Web Browser (Chrome, Firefox, Safari, Edge)
- **Deployment Strategy:** Static File Hosting (e.g., Vercel, Netlify, GitHub Pages) or Local Execution (`file://` / `vite preview`).
- **Core Framework:** React 18+ powered by Vite build tool.
- **Language:** TypeScript for type safety and clear domain models.

## 2. Component Architecture

### 2.1 State Management (`App.tsx`)
The application relies on a unidirectional data flow (React state). The main state is an array of `PageItem` objects.
- **Source of Truth:** The `pages` state array holds the sequence, properties (width, height), and user decisions (orientation confirmation).
- **Actions:** Handlers for `onFilesDropped`, `onDragEnd` (reordering), `onOrientationToggle`, `onConfirmAll`, `onRemovePage`.

### 2.2 Visual Components (Impeccable Style)
- **`DropzoneArea`:** Connects to the HTML5 Drag and Drop API and `File API`. Routes `.zip` streams to the `zipHandler`.
- **`SortableGrid`:** Uses `@dnd-kit/core` to render a grid of `SortableItem` components. Translates physical drag movements into array index swaps.
- **`ThumbnailCard`:** A sub-component of `SortableGrid` displaying the image blob, orientation switch, and filename.
- **`ActionPanel`:** A fixed bottom/top bar housing global actions ("Confirm All", "Clear All", "Generate & Email PDF").
- **`EmailModal`**: A smart popup component responsible for allowing the user to provide an email address, verify it, and track the status of sending the generated PDF via EmailJS.

### 2.3 Core Libraries (The "Lib" Directory)

#### `zipHandler.ts`
- **Responsibility:** Ingests a `File` object representing a ZIP archive.
- **Dependency:** `jszip`.
- **Output:** Resolves a `Promise<File[]>` containing only valid image mimetypes. Non-image files inside the archive are silently discarded.

#### `pdfGenerator.ts`
- **Responsibility:** Ingests an array of `PageItem` objects and orchestrates PDF generation.
- **Dependency:** `jspdf`.
- **Algorithm:**
  1. Initialize `new jsPDF({ format: 'a4' })`.
  2. For each `PageItem`:
     - Read the confirmed orientation (`portrait` or `landscape`).
     - Calculate scaling factor: `Math.min(A4_WIDTH / img_width, A4_HEIGHT / img_height)`.
     - Calculate offsets to center the image on the A4 page (Zero Margins means the image touches the A4 edges on its longest dimension relative to the A4 ratio).
     - Call `pdf.addImage()`.
     - Call `pdf.addPage()` (unless it's the last item).
  3. Return the generated PDF as a Base64 data URI string (`pdf.output('datauristring')`) so the UI can attach it via the email handler.

#### `emailHandler.ts`
- **Responsibility:** Interfaces with `@emailjs/browser` to send the generated PDF to a user-provided email address.
- **Dependency:** `@emailjs/browser`.
- **Input:** Recipient email string, Base64 PDF data string.
- **Output:** Returns a Promise that resolves on successful delivery or rejects on failure.

#### `sortLogic.ts`
- **Responsibility:** Applies Natural Sort algorithm to filenames.
- **Output:** Returns a newly sorted array. Decoupled from React to ensure easy unit testing.

## 3. Test Architecture (Vitest)
The application follows strict TDD principles.

### 3.1 Unit Testing (`lib/*.test.ts`)
- Pure functions (`sortLogic.ts`, mathematical calculations in `pdfGenerator.ts`) are tested extensively for edge cases using Vitest.

### 3.2 Integration Testing / Mocking
- **`jszip` Mocking:** Test `zipHandler.ts` by providing a mocked binary stream or utilizing static fixture zip files containing known assets.
- **`jspdf` Mocking:** `pdfGenerator.ts` is tested by spying on the `jsPDF` constructor and its `.addImage`, `.save` methods to ensure the calculated dimensions and order are correct without actually generating binary PDF data in the test runner.

## 4. Performance Considerations
- **Memory Pressure:** Storing 50+ high-res smartphone images as `Blob URLs` could strain lower-end devices. `URL.revokeObjectURL()` must be called whenever an image is removed or the state is cleared to prevent memory leaks.
- **UI Blocking:** Heavy PDF generation might block the main thread. While Web Workers are the ideal solution for large PDF generation, V1 will keep logic on the main thread but may use `requestAnimationFrame` yielding if browser hang becomes an issue.
