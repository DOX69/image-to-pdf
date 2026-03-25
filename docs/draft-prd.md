# Product Requirements Document (PRD): PNG to PDF Web App

## 1. Product Overview
The PNG to PDF Web App is a client-side tool designed to eliminate the frustration of manually inserting and resizing images in word processors (e.g., MS Word) to create document PDFs. It specifically targets users capturing documents via mobile devices who need to quickly collate those images into a pristine, properly formatted PDF, which can then be sent via email.

## 2. Core Value Proposition
- **Surgical Precision:** Images are automatically fitted to A4 pages without disrupting surrounding layouts.
- **Speed & Simplicity:** Client-side processing means zero upload wait times and maximum privacy.
- **Batch Processing:** Accepts both zipped archives and multiple image files dropped directly into the browser.
- **Instant Delivery:** Email integration allows sending the generated PDF directly from the browser.

## 3. User Stories
1. **As a user**, I want to drag and drop a `.zip` file containing multiple `.png`/`.jpg` files so that I don't have to extract them manually.
2. **As a user**, I want to drag and drop multiple individual image files directly into the app.
3. **As a user**, I want the app to automatically sort my files numerically based on the filename (e.g., `Page1` -> `Page2`... `Page10`) so that I don't have to rename or manually sort them initially.
4. **As a user**, I want to see a visual grid of my imported pages and be able to drag-and-drop them to fix any sorting errors before generation.
5. **As a user**, I want the app to automatically detect the best A4 orientation (Portrait or Landscape) for each image.
6. **As a user**, I want the ability to individually confirm/override the detected orientation for a page, or click a "Confirm All" button to accept the auto-detection for all pages.
7. **As a user**, I want the final PDF to have **0 margins** (touching the absolute edge) and scale using **"Fit" logic** (meaning the entire image is visible, maintaining its original aspect ratio, even if it leaves white bars).

## 4. Functional Requirements

### 4.1 Input Handling
- **Supported Formats:** `.zip` (containing images), `.png`, `.jpg`, `.jpeg`.
- **Method:** Drag-and-drop zone + manual file selection dialog.

### 4.2 Processing & State
- **Extraction:** ZIP files must be parsed in-memory using `jszip`. Non-image files inside the zip must be ignored.
- **Sorting Logic:** Must implement a Natural Sort algorithm to handle numbers in strings properly.
- **Page State Model:**
  ```typescript
  type PageItem = {
    id: string;
    originalName: string;
    blobUrl: string;
    detectedOrientation: 'portrait' | 'landscape';
    userConfirmedOrientation: 'portrait' | 'landscape' | null;
    width: number;
    height: number;
  };
  ```

### 4.3 User Interface (impeccable.style Design)
- **Aesthetic:** Emphasize thoughtful design inspired by [impeccable.style](https://impeccable.style/) (clear visual hierarchy, purposeful elements, ample breathing whitespace, and a high-end feel).
- **Dropzone:** Prominent central area with clear, minimalist typography.
- **Grid View:**
  - Thumbnails for each image.
  - Filename displayed below thumbnail.
  - Drag handlers for reordering.
  - Delete button per item.
  - Orientation toggle switch (Portrait/Landscape) with visual indicator of "Auto-detected" vs "User-confirmed".
- **Global Actions Bar:**
  - "Confirm All Orientations" button.
  - "Clear All" button.
  - "Generate & Email PDF" (Disabled if orientations are not all confirmed).
- **Email Confirmation Modal:**
  - After generation, a sleek modal appears allowing the user to enter and confirm their email address.
  - Crucial UX: Contains clear input fields and a "Send PDF" button, displaying loading and success states.
  - **Privacy Text:** Explicitly states the PDF will be sent via EmailJS and no data is retained.

### 4.4 PDF Generation Engine
- **Library:** `jsPDF`.
- **Output Delivery:** The generated PDF is converted to a Base64 data URI to be attached to an email via EmailJS.
- **Page Size:** A4 (210 x 297 mm).
- **Fitting Logic:** 
  1. Determine page orientation based on user confirmation.
  2. Calculate aspect ratio of the image vs the A4 page.
  3. Scale image to fit the maximum dimension of the A4 page (width or height) without cropping.
  4. Center the image on the page (leaving white bars on the non-filling axis).
  5. Apply 0px margins.

## 5. Non-Functional Requirements
- **Privacy:** Absolutely no data leaves the browser, except for the secure payload sent to the EmailJS service to dispatch the email. No custom backend API calls for processing.
- **Performance:** App should handle at least 50 images (~100MB) without crashing the browser tab.
- **Development Methodology:** Strict Test-Driven Development (TDD) using Vitest.

## 6. Out of Scope (V1)
- Image editing (cropping, rotating, brightness/contrast adjustments).
- Optical Character Recognition (OCR).
