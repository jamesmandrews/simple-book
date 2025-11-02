# Simple Book - Markdown Book Renderer

An Angular 19 application for rendering Markdown-based books with navigation and a clean reading interface.

## Features

- Dynamic chapter loading from JSON manifest
- Markdown to HTML rendering with `marked`
- Responsive navigation sidebar
- Previous/Next chapter navigation
- Mobile-friendly design
- Multi-book support via separate directories

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── chapter-viewer/     # Displays rendered chapters
│   │   └── book-navigation/    # Sidebar navigation
│   ├── services/
│   │   └── book-loader.service.ts  # Loads manifest and content
│   └── models/
│       └── book.model.ts       # TypeScript interfaces
└── assets/
    └── books/
        └── electronics/        # Each book in its own directory
            ├── book.json       # Book manifest
            ├── chapter01.md
            ├── chapter02.md
            └── ...
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Book Content

Create a directory in `src/assets/books/` for your book:

```bash
mkdir -p src/assets/books/your-book-name
```

### 3. Create Book Manifest

Create `src/assets/books/your-book-name/book.json`:

```json
{
  "title": "Your Book Title",
  "author": "Author Name",
  "version": "1.0.0",
  "chapters": [
    {
      "id": "chapter01",
      "title": "Introduction",
      "file": "chapter01.md",
      "part": "Getting Started",
      "order": 1
    }
  ],
  "appendices": []
}
```

See `book.json.example` for a complete example.

### 4. Add Markdown Files

Add your chapter Markdown files to the same directory:

```
src/assets/books/your-book-name/
├── book.json
├── chapter01.md
├── chapter02.md
└── ...
```

### 5. Configure Book Path

Edit `src/app/services/book-loader.service.ts` and set the default book path:

```typescript
private bookPath = '/assets/books/your-book-name';
```

## Development

Start the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`

## Building for Production

```bash
ng build
```

The build artifacts will be in the `dist/` directory.

## Multi-Book Support

To build different versions for different books:

1. Each book lives in `src/assets/books/[book-name]/`
2. Update `bookPath` in `book-loader.service.ts` before building
3. Build separately for each book version

Alternatively, implement runtime book switching via configuration or routing.

## Book Content Guidelines

- Use zero-padded chapter numbering: `chapter01.md`, `chapter02.md`
- Use letter suffixes for appendices: `appendixA.md`, `appendixB.md`
- Each book must have a `book.json` manifest
- Markdown files support standard GitHub-flavored Markdown
- Chapter IDs must match the filename without extension

## Git Workflow

Book content is ignored by git (see `.gitignore`). This allows you to:
- Keep book content in separate repositories
- Swap books without changing the codebase
- Build different book versions from the same Angular app

## Angular CLI Commands

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.12.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## License

MIT
