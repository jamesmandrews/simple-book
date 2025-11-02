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

  ngOnInit(): void {
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

  getPartKeys(): string[] {
    return Array.from(this.groupedNavigation.keys());
  }
}
