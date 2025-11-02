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

  public manifest$ = this.manifestSubject.asObservable();

  // Path to book assets - configurable for different books
  private bookPath = '/assets/books/electronics-beginner'; // Default book

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
