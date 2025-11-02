# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Angular 19 application** called "Simple Book" that renders textbooks from Markdown files into HTML. The application supports multiple books and provides a custom book reader interface with navigation, chapter routing, dark mode, and Markdown-to-HTML rendering capabilities.

## Repository Structure

```
src/
├── app/
│   ├── components/
│   │   ├── book-navigation/      # Sidebar navigation component
│   │   └── chapter-viewer/       # Main content rendering component
│   ├── services/
│   │   ├── book-loader.service.ts  # Manages book loading and navigation
│   │   └── theme.service.ts        # Dark mode management
│   ├── models/
│   │   └── book.model.ts          # TypeScript interfaces for book structure
│   ├── app.component.*            # Root component with header and layout
│   └── app.routes.ts              # Route configuration
├── assets/
│   ├── book-config.json           # Configuration file listing available books
│   └── books/
│       ├── electronics-beginner/  # Example book directory
│       │   ├── book.json          # Book manifest with metadata and structure
│       │   ├── chapter01.md       # Chapter markdown files
│       │   ├── chapter02.md
│       │   └── ...
│       └── [other-books]/         # Additional books in separate directories
└── styles.css                     # Global styles including theme variables
```

## Book Configuration

### book-config.json

Located at `src/assets/book-config.json`, this file lists all available books:

```json
{
  "books": [
    {
      "id": "electronics-beginner",
      "name": "Electronics Beginner"
    }
  ],
  "defaultBook": "electronics-beginner"
}
```

- **books**: Array of available books with `id` (directory name) and `name` (display name)
- **defaultBook**: ID of the book to load by default

### Book Manifest (book.json)

Each book directory must contain a `book.json` manifest file:

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "version": "1.0.0",
  "description": "Book description",
  "chapters": [
    {
      "id": "chapter01",
      "title": "Chapter Title",
      "file": "chapter01.md",
      "order": 1,
      "part": "Part I: Section Name"
    }
  ],
  "appendices": [
    {
      "id": "appendixA",
      "title": "Appendix Title",
      "file": "appendixA.md",
      "order": 1
    }
  ]
}
```

**Key Fields:**
- `chapters`: Array of chapter definitions with ID, title, file path, order, and part grouping
- `appendices`: Array of appendix definitions
- `part`: Used to group chapters in the navigation sidebar

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

1. **BookLoaderService** (`src/app/services/book-loader.service.ts`)
   - Loads `book-config.json` on initialization to get available books
   - Manages current book selection with cookie persistence
   - Loads book manifest (`book.json`) for current book
   - Fetches markdown files via HTTP
   - Caches loaded chapter content for performance
   - Provides navigation structure (grouped by parts)
   - Handles book switching

2. **ThemeService** (`src/app/services/theme.service.ts`)
   - Manages dark mode state
   - Persists theme preference via cookies
   - Applies theme by toggling `dark-mode` class on document body

#### Components

1. **AppComponent** - Root component with sticky header
   - Displays book title
   - Book selector dropdown (top-right)
   - Dark mode toggle button
   - Manages overall layout with sidebar and content area

2. **ChapterViewerComponent** - Displays rendered chapter content
   - Receives chapter/appendix ID from route parameters
   - Waits for manifest to load before fetching content
   - Renders Markdown to HTML using `marked` library
   - Uses `bypassSecurityTrustHtml` for rendering (safe for trusted content)
   - Shows previous/next navigation at top and bottom
   - Displays loading state and error messages

3. **BookNavigationComponent** - Sidebar navigation
   - Displays chapters grouped by parts
   - Shows appendices in separate group
   - Highlights current chapter with `routerLinkActive`
   - Mobile responsive with toggle button

#### Routing

Routes are configured in `src/app/app.routes.ts`:
```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/chapter/chapter01', pathMatch: 'full' },
  { path: 'chapter/:id', component: ChapterViewerComponent },
  { path: 'appendix/:id', component: ChapterViewerComponent },
];
```

#### Theme System

The application uses CSS custom properties for theming:
- Light mode: Default variables defined in `:root`
- Dark mode: Overridden in `.dark-mode` class
- Theme persisted via cookies
- Variables include: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--link-color`, etc.

#### State Management

- **RxJS BehaviorSubjects** for reactive state:
  - `manifest$`: Current book manifest
  - `currentBook$`: Currently selected book ID
  - `availableBooks$`: List of available books
  - `darkMode$`: Theme state
- **Cookie persistence** for:
  - Selected book (`selected-book`)
  - Theme preference (`theme`)

### Content Rendering

- **Markdown parsing**: Uses `marked` library with GitHub Flavored Markdown (GFM)
- **HTML rendering**: Rendered via `[innerHTML]` binding with `SafeHtml`
- **Security**: Uses `bypassSecurityTrustHtml()` - acceptable for trusted book content
- **Styling**: Global styles in `src/styles.css` target rendered HTML elements
- **Tables**: Styled with borders, zebra striping, and hover effects

## Common Development Tasks

### Adding a New Book

1. Create a new directory in `src/assets/books/` (e.g., `my-new-book/`)
2. Create a `book.json` manifest file with metadata, chapters, and appendices
3. Add markdown files for each chapter/appendix
4. Update `src/assets/book-config.json` to include the new book:
   ```json
   {
     "books": [
       {"id": "existing-book", "name": "Existing Book"},
       {"id": "my-new-book", "name": "My New Book"}
     ],
     "defaultBook": "existing-book"
   }
   ```
5. No code changes needed - the app loads books dynamically

### Adding a Chapter to Existing Book

1. Create the markdown file in the book directory (e.g., `chapter05.md`)
2. Update the book's `book.json` manifest:
   ```json
   {
     "id": "chapter05",
     "title": "Chapter Title",
     "file": "chapter05.md",
     "order": 5,
     "part": "Part I: Section Name"
   }
   ```
3. No code changes needed - navigation updates automatically

### Styling the Rendered Content

- Global styles for rendered markdown are in `src/styles.css`
- Use CSS custom properties for theming (e.g., `var(--text-primary)`)
- Styles apply to dynamically rendered HTML via `[innerHTML]`
- Component-scoped styles won't work for rendered markdown - use global styles

### Modifying the Theme

Theme variables are defined in `src/styles.css`:
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  /* ... more variables */
}

.dark-mode {
  --bg-primary: #1a1a1a;
  --text-primary: #e0e0e0;
  /* ... override variables */
}
```

## Important Notes

### Book Content Location

- Books are stored in `src/assets/books/` with each book in its own directory
- Each book directory should be in a **separate git repository**
- `.gitignore` excludes `src/assets/books/*/` to prevent committing book content
- Only `.gitkeep` files in book directories are tracked

### Configuration Management

- **DO NOT hardcode book lists** in services or components
- Book list is loaded from `src/assets/book-config.json`
- This allows adding/removing books without code changes

### Security Considerations

- The app uses `bypassSecurityTrustHtml()` to render markdown-generated HTML
- This is acceptable because book content is trusted (you control the markdown files)
- **Do not** use this approach if rendering user-generated content

### State Management

- Services use RxJS `BehaviorSubject` for reactive state
- Components subscribe to observables and clean up with `takeUntil(destroy$)`
- Avoid memory leaks by always unsubscribing in `ngOnDestroy`

### Async Loading

- Book config loads asynchronously on app initialization
- `bookPath` must be set **before** emitting to `currentBookSubject`
- Components must wait for manifest to load before fetching content
- Use `combineLatest` or `filter` operators to handle async dependencies
