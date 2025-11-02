# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Angular 19 application** that renders a beginner-friendly electronics textbook from Markdown files into HTML. The book content (located in `book/`) covers electronics fundamentals from basic concepts (voltage, current, resistance) through practical projects and microcontroller programming. The content is organized into 20 chapters and 4 appendices.

The Angular application provides a custom book reader interface with navigation, chapter routing, and Markdown-to-HTML rendering capabilities.

## Repository Structure

```
book/                   # Source Markdown content
├── SUMMARY.md          # Table of contents with chapter structure
├── chapter01.md        # Chapter 1: Introduction to Electronics
├── chapter02.md        # Chapter 2: Ohm's Law
├── ...
├── chapter20.md        # Chapter 20: Next Steps
├── appendixA.md        # Component Reference Guide
├── appendixB.md        # Essential Formulas
├── appendixC.md        # Troubleshooting Guide
└── appendixD.md        # Glossary

src/                    # Angular application (to be created)
└── app/
    ├── components/     # Book reader UI components
    ├── services/       # Markdown parsing and chapter loading
    ├── models/         # Chapter and book structure models
    └── pipes/          # Markdown rendering pipes
```

## Book Content Organization

The book is divided into six main parts:
1. **Part I: Fundamentals** (Chapters 1-3) - Basic electrical concepts and schematics
2. **Part II: Components** (Chapters 4-7) - Resistors, capacitors, inductors, diodes
3. **Part III: Circuits** (Chapters 8-10) - Series, parallel, and combination circuits
4. **Part IV: Active Components** (Chapters 11-12) - Transistors and integrated circuits
5. **Part V: Practical Applications** (Chapters 13-16) - Power supplies, digital electronics, sensors, microcontrollers
6. **Part VI: Building Projects** (Chapters 17-20) - Breadboarding, soldering, beginner projects

### Chapter Naming Convention

Chapters follow a zero-padded two-digit naming scheme: `chapter01.md` through `chapter20.md`. Appendices use letter suffixes: `appendixA.md` through `appendixD.md`.

### Content Structure

Each chapter typically includes:
- Introduction section
- Multiple topical subsections with headers
- Practical examples and explanations
- Chapter summary at the end
- "Before Moving to Next Chapter" checklist

### SUMMARY.md

The `SUMMARY.md` file serves as the book's table of contents and defines the navigation structure. The Angular app should parse this file to generate the navigation menu and chapter ordering.

## Angular Application Development

### Setup and Installation

1. **Initialize Angular project** (if not already done):
   ```bash
   ng new . --skip-git --routing --style=css
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Markdown parsing library**:
   ```bash
   npm install marked
   npm install --save-dev @types/marked
   ```
   Or use `ngx-markdown`:
   ```bash
   npm install ngx-markdown marked
   ```

### Development Commands

- **Start development server**:
  ```bash
  ng serve
  ```
  Runs at `http://localhost:4200` with hot reload

- **Build for production**:
  ```bash
  ng build
  ```
  Outputs to `dist/` directory

- **Run tests**:
  ```bash
  ng test
  ```

- **Run linting**:
  ```bash
  ng lint
  ```

- **Generate component**:
  ```bash
  ng generate component components/chapter-viewer
  ng generate component components/navigation
  ng generate component components/table-of-contents
  ```

- **Generate service**:
  ```bash
  ng generate service services/markdown-loader
  ng generate service services/chapter-navigation
  ```

### Key Application Architecture

#### Services

1. **MarkdownLoaderService** - Loads Markdown files from `book/` directory
   - Fetches `.md` files via HTTP
   - Parses SUMMARY.md to build book structure
   - Caches loaded chapters for performance

2. **ChapterNavigationService** - Manages navigation between chapters
   - Tracks current chapter
   - Provides next/previous chapter navigation
   - Handles routing to specific chapters

3. **MarkdownParserService** - Converts Markdown to HTML
   - Uses `marked` or `ngx-markdown` library
   - Sanitizes HTML output
   - Applies custom styling to rendered content

#### Components

1. **ChapterViewerComponent** - Displays rendered chapter content
   - Receives chapter ID from route parameters
   - Loads and displays Markdown content as HTML
   - Handles navigation to next/previous chapters

2. **NavigationComponent** - Sidebar or header navigation
   - Displays book structure from SUMMARY.md
   - Highlights current chapter
   - Provides quick navigation to any chapter

3. **TableOfContentsComponent** - In-page table of contents
   - Extracts headers from current chapter
   - Provides jump-to-section links
   - Updates on scroll position

#### Routing

Configure routes for chapter navigation:
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/chapter/01', pathMatch: 'full' },
  { path: 'chapter/:id', component: ChapterViewerComponent },
  { path: 'appendix/:id', component: ChapterViewerComponent },
  { path: '**', redirectTo: '/chapter/01' }
];
```

### Markdown File Loading

Since Angular runs in the browser, Markdown files need to be:
1. **Placed in `src/assets/book/`** - Copy from `book/` to `src/assets/book/`
2. **Loaded via HTTP** - Use `HttpClient` to fetch files
3. **Configured in `angular.json`** - Add `book/` to assets array:
   ```json
   "assets": [
     "src/favicon.ico",
     "src/assets",
     { "glob": "**/*", "input": "book/", "output": "/assets/book/" }
   ]
   ```

### Content Rendering Considerations

- **Sanitization**: Use Angular's `DomSanitizer` to safely render HTML from Markdown
- **Syntax highlighting**: Consider adding `prismjs` or `highlight.js` for code blocks
- **Math rendering**: If formulas exist, integrate `KaTeX` or `MathJax`
- **Responsive design**: Ensure readable text on mobile devices
- **Dark mode**: Consider theme support for better reading experience

## Content Guidelines

### Writing Style

The book uses:
- **Friendly, conversational tone** targeting complete beginners
- **Water analogy** for explaining electrical concepts (voltage as pressure, current as flow, resistance as restriction)
- **Practical examples** relating concepts to everyday devices
- **Progressive complexity** building from fundamentals to advanced topics

### Technical Accuracy

When editing book content:
- Maintain technical accuracy while keeping explanations accessible
- Use correct units: volts (V), amperes/amps (A), ohms (Ω), watts (W), farads (F), henries (H)
- Follow standard electronics notation and conventions
- Verify formulas (especially in Appendix B)

### Markdown Consistency

Maintain consistency across chapters:
- Heading hierarchy (# for chapter titles, ## for major sections, ### for subsections)
- Code formatting for formulas and values (e.g., `V = I × R`)
- Bold (`**text**`) for emphasis on first introduction of key terms
- Chapter summary format at the end of each chapter

## Common Development Tasks

### Adding a New Chapter

1. Create the Markdown file: `book/chapterXX.md` (use zero-padded numbering)
2. Follow the standard chapter structure with introduction, sections, and summary
3. Update `book/SUMMARY.md` to include the new chapter
4. No code changes needed - the Angular app loads chapters dynamically

### Modifying the Book Reader UI

When updating the Angular application:
1. Keep the `book/` directory as the source of truth for content
2. Don't hardcode chapter lists - parse from SUMMARY.md
3. Maintain responsive design for mobile reading
4. Test navigation between all chapters and appendices

### Styling the Rendered Content

- Create global styles for rendered Markdown in `src/styles.css`
- Target rendered HTML elements (`.markdown-content h2`, `.markdown-content code`, etc.)
- Ensure readability: appropriate font sizes, line heights, and spacing
- Style code blocks, blockquotes, and lists appropriately

## Version Control

The `.gitignore` currently excludes `/book`, which contains the source Markdown files. Update `.gitignore` to exclude Angular build artifacts while keeping book content:

```
# Angular
/dist
/node_modules
/.angular
.angular/

# IDE
.vscode/
.idea/

# Environment
.env
.env.local
```

Do NOT exclude `/book` - this is source content, not build output.
