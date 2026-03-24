# Image to PDF

A secure, 100% client-side web application to convert multiple PNG/JPG image files (or ZIP archives containing images) into a single, ordered, and password-protected PDF.

## Features
- **Client-Side Processing**: Files are processed directly in your browser. No data is sent to any server.
- **ZIP Support**: Drag and drop a ZIP archive, and the app automatically extracts embedded PNG and JPG formatting.
- **Natural Number Sorting**: Automatically sorts pages numerically (e.g., `Page 1`, `Page 2` comes before `Page 10`).
- **Drag & Drop Reordering**: Allows manual reordering of pages before generating the PDF.
- **A4 Fitting & 0 Margins**: Intelligently fits your images to an A4 PDF document seamlessly.
- **Password Protection**: Generates a random 12-character alphanumeric password ensuring your output PDF is secured with encryption.

## Getting Started

1. Clone or download this project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Design Philosophy

This project adopts the [impeccable.style](https://impeccable.style/) principles for an exceptionally minimalist user interface. It focuses heavily on purposeful whitespace, typographic hierarchy, and clean micro-interactions.

## TDD Approach

Built strictly following Test-Driven Development (TDD). 
To run the automated tests:
```bash
npm test
```
