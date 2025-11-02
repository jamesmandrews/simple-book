import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { BookManifest, Chapter, Appendix, NavigationItem, BookContent } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookLoaderService {
  private http = inject(HttpClient);
  private manifestSubject = new BehaviorSubject<BookManifest | null>(null);
  private contentCache = new Map<string, string>();
  private currentBookSubject = new BehaviorSubject<string>('electronics-beginner');

  public manifest$ = this.manifestSubject.asObservable();
  public currentBook$ = this.currentBookSubject.asObservable();

  // Available books - hardcoded for now, could be fetched from a config file
  private availableBooks = [
    { id: 'electronics-beginner', name: 'Electronics Beginner' },
    { id: 'electronics-beginner-two', name: 'Electronics Beginner Two' }
  ];

  // Path to book assets - configurable for different books
  private bookPath = '/assets/books/electronics-beginner'; // Default book
  private readonly BOOK_KEY = 'selected-book';

  constructor() {
    // Load saved book preference or use default
    const savedBook = this.getCookie(this.BOOK_KEY);
    if (savedBook && this.availableBooks.some(b => b.id === savedBook)) {
      this.currentBookSubject.next(savedBook);
      this.bookPath = `/assets/books/${savedBook}`;
    }
  }

  /**
   * Load the book manifest (book.json)
   */
  loadManifest(): Observable<BookManifest> {
    return this.http.get<BookManifest>(`${this.bookPath}/book.json`).pipe(
      tap(manifest => this.manifestSubject.next(manifest)),
      catchError(error => {
        console.error('Failed to load book manifest:', error);
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get available books
   */
  getAvailableBooks() {
    return this.availableBooks;
  }

  /**
   * Get current book ID
   */
  getCurrentBook(): string {
    return this.currentBookSubject.value;
  }

  /**
   * Switch to a different book
   */
  switchBook(bookId: string): Observable<BookManifest> {
    if (!this.availableBooks.some(b => b.id === bookId)) {
      throw new Error(`Book not found: ${bookId}`);
    }

    // Update current book
    this.currentBookSubject.next(bookId);
    this.bookPath = `/assets/books/${bookId}`;

    // Clear cache
    this.contentCache.clear();
    this.manifestSubject.next(null);

    // Save to cookie
    this.setCookie(this.BOOK_KEY, bookId, 365);

    // Load new manifest
    return this.loadManifest();
  }

  /**
   * Get the current manifest
   */
  getManifest(): BookManifest | null {
    return this.manifestSubject.value;
  }

  /**
   * Load a specific chapter or appendix content
   */
  loadContent(id: string): Observable<BookContent> {
    const manifest = this.getManifest();
    if (!manifest) {
      throw new Error('Manifest not loaded. Call loadManifest() first.');
    }

    // Check cache first
    if (this.contentCache.has(id)) {
      const cached = this.contentCache.get(id)!;
      const item = this.findItemById(id, manifest);
      return of({
        id,
        title: item?.title || '',
        content: cached,
        type: item?.type || 'chapter'
      });
    }

    // Find the item in manifest
    const item = this.findItemById(id, manifest);
    if (!item) {
      throw new Error(`Content not found: ${id}`);
    }

    // Load from file
    return this.http.get(`${this.bookPath}/${item.file}`, { responseType: 'text' }).pipe(
      tap(content => this.contentCache.set(id, content)),
      map(content => ({
        id,
        title: item.title,
        content,
        type: item.type
      })),
      catchError(error => {
        console.error(`Failed to load content for ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get navigation structure from manifest
   */
  getNavigation(): NavigationItem[] {
    const manifest = this.getManifest();
    if (!manifest) {
      return [];
    }

    const chapters: NavigationItem[] = manifest.chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      route: `/chapter/${ch.id}`,
      type: 'chapter' as const,
      part: ch.part,
      order: ch.order
    }));

    const appendices: NavigationItem[] = manifest.appendices.map(app => ({
      id: app.id,
      title: app.title,
      route: `/appendix/${app.id}`,
      type: 'appendix' as const,
      order: app.order
    }));

    return [...chapters, ...appendices];
  }

  /**
   * Get navigation grouped by parts
   */
  getGroupedNavigation(): Map<string, NavigationItem[]> {
    const navigation = this.getNavigation();
    const grouped = new Map<string, NavigationItem[]>();

    // Group chapters by part
    const chapters = navigation.filter(item => item.type === 'chapter');
    chapters.forEach(item => {
      const part = item.part || 'Other';
      if (!grouped.has(part)) {
        grouped.set(part, []);
      }
      grouped.get(part)!.push(item);
    });

    // Add appendices as separate group
    const appendices = navigation.filter(item => item.type === 'appendix');
    if (appendices.length > 0) {
      grouped.set('Appendices', appendices);
    }

    return grouped;
  }

  /**
   * Get next/previous navigation items
   */
  getAdjacentItems(currentId: string): { previous: NavigationItem | null, next: NavigationItem | null } {
    const navigation = this.getNavigation();
    const currentIndex = navigation.findIndex(item => item.id === currentId);

    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    return {
      previous: currentIndex > 0 ? navigation[currentIndex - 1] : null,
      next: currentIndex < navigation.length - 1 ? navigation[currentIndex + 1] : null
    };
  }

  /**
   * Configure book path (for switching between different books)
   */
  setBookPath(path: string): void {
    this.bookPath = path;
    this.manifestSubject.next(null);
    this.contentCache.clear();
  }

  private setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  /**
   * Helper to find item by ID
   */
  private findItemById(id: string, manifest: BookManifest): (Chapter & { type: 'chapter' }) | (Appendix & { type: 'appendix' }) | null {
    const chapter = manifest.chapters.find(ch => ch.id === id);
    if (chapter) {
      return { ...chapter, type: 'chapter' as const };
    }

    const appendix = manifest.appendices.find(app => app.id === id);
    if (appendix) {
      return { ...appendix, type: 'appendix' as const };
    }

    return null;
  }
}
