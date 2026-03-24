# Image to PDF - AI Agent Guidelines

This file serves as the knowledge base and guideline rules for any AI agent or IDE (Antigravity, Gemini CLI, Cursor, etc.) contributing to the `image-to-pdf` repository.

## Core Rules
1. **Test-Driven Development (TDD) Workflow Is Mandatory:**
   - Any new feature or bugfix must start with a failing test!
   - Follow the `Red-Green-Refactor` cycle explicitly.
   - Run tests (`npm test` or `npx vitest run`) before marking tasks as fully complete.

2. **Client-Side Only Constraints:**
   - This application is strictly 100% client-side.
   - **DO NOT** introduce any server-side logic (e.g., Node.js backend controllers, API routes) for data processing.
   - Libraries used must run entirely within the browser context (`jszip`, `jspdf`).

3. **Design Guidelines (impeccable.style):**
   - No bloated CSS frameworks like Tailwind layout classes unless explicitly configured.
   - Core styles rely on minimalist, readable vanilla CSS residing inside `src/index.css` following impeccable.style principles.
   - Preserve typographic hierarchy, whitespace, and accessibility rules.

4. **Security Expectations:**
   - PDF Generation must apply an auto-generated 12-character alphanumeric password using `jsPDF`'s encryption capabilities.
   - The password MUST be revealed precisely once via the Smart Password Popup (`PasswordModal.tsx`).

5. **Sorting Mechanisms:**
   - Sorting is done entirely via "Natural Numeric Sorting" using native `localeCompare({ numeric: true })`. Do not write regex-based manual custom sorters unless standard sorting fails core tests.

6. **Skills folder:**
   - All skills for this project are located in the `.agents/skills` directory.
   - Skills folders has to be ignored in .gitignore file.

7. **Workflow:**
   - AI workflows are in `.agents/workflows` directory.
   - Each workflow should be modular, reusable, and well-documented.
