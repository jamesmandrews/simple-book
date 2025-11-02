import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { BookNavigationComponent } from './components/book-navigation/book-navigation.component';
import { BookLoaderService } from './services/book-loader.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BookNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private bookLoader = inject(BookLoaderService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  bookTitle = '';
  availableBooks: Array<{id: string, name: string}> = [];
  currentBookId = '';
  isDarkMode = false;

  ngOnInit(): void {
    // Get available books
    this.availableBooks = this.bookLoader.getAvailableBooks();
    this.currentBookId = this.bookLoader.getCurrentBook();

    // Load the book manifest on app initialization
    this.bookLoader.loadManifest().subscribe({
      next: (manifest) => {
        console.log('Book loaded:', manifest.title);
      },
      error: (err) => {
        console.error('Failed to load book manifest:', err);
      }
    });

    // Subscribe to manifest changes for title
    this.bookLoader.manifest$.pipe(
      filter(manifest => manifest !== null),
      takeUntil(this.destroy$)
    ).subscribe(manifest => {
      if (manifest) {
        this.bookTitle = manifest.title;
      }
    });

    // Subscribe to theme changes
    this.themeService.darkMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Subscribe to current book changes
    this.bookLoader.currentBook$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(bookId => {
      this.currentBookId = bookId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onBookChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const bookId = select.value;

    if (bookId !== this.currentBookId) {
      this.bookLoader.switchBook(bookId).subscribe({
        next: () => {
          // Navigate to first chapter of new book
          this.router.navigate(['/chapter/chapter01']);
        },
        error: (err) => {
          console.error('Failed to switch book:', err);
        }
      });
    }
  }
}
