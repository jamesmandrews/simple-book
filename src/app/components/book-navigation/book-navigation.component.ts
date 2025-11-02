import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { BookLoaderService } from '../../services/book-loader.service';
import { ThemeService } from '../../services/theme.service';
import { NavigationItem } from '../../models/book.model';

@Component({
  selector: 'app-book-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './book-navigation.component.html',
  styleUrl: './book-navigation.component.css'
})
export class BookNavigationComponent implements OnInit, OnDestroy {
  private bookLoader = inject(BookLoaderService);
  private router = inject(Router);
  public themeService = inject(ThemeService);
  private destroy$ = new Subject<void>();

  bookTitle = '';
  groupedNavigation: Map<string, NavigationItem[]> = new Map();
  isOpen = true;
  isDarkMode = false;
  availableBooks: Array<{id: string, name: string}> = [];
  currentBookId = '';

  ngOnInit(): void {
    // Get available books
    this.availableBooks = this.bookLoader.getAvailableBooks();
    this.currentBookId = this.bookLoader.getCurrentBook();

    // Subscribe to manifest changes
    this.bookLoader.manifest$.pipe(
      filter(manifest => manifest !== null),
      takeUntil(this.destroy$)
    ).subscribe(manifest => {
      if (manifest) {
        this.bookTitle = manifest.title;
        this.groupedNavigation = this.bookLoader.getGroupedNavigation();
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

  toggleNavigation(): void {
    this.isOpen = !this.isOpen;
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

  getPartKeys(): string[] {
    return Array.from(this.groupedNavigation.keys());
  }
}
