import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, switchMap, filter, combineLatest, take } from 'rxjs';
import { marked } from 'marked';
import { BookLoaderService } from '../../services/book-loader.service';
import { BookContent, NavigationItem } from '../../models/book.model';
import { CodeCopyDirective } from '../../directives/code-copy.directive';

@Component({
  selector: 'app-chapter-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeCopyDirective],
  templateUrl: './chapter-viewer.component.html',
  styleUrl: './chapter-viewer.component.css'
})
export class ChapterViewerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private bookLoader = inject(BookLoaderService);
  private sanitizer = inject(DomSanitizer);
  private destroy$ = new Subject<void>();

  content: BookContent | null = null;
  renderedHtml: SafeHtml | null = null;
  loading = true;
  error: string | null = null;

  previousItem: NavigationItem | null = null;
  nextItem: NavigationItem | null = null;

  ngOnInit(): void {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: false,
    });

    // Wait for both manifest and route params, then load content
    combineLatest([
      this.bookLoader.manifest$.pipe(filter(manifest => manifest !== null)),
      this.route.params
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([manifest, params]) => {
        this.loading = true;
        this.error = null;
        const id = params['id'];
        return this.bookLoader.loadContent(id);
      })
    ).subscribe({
      next: (content) => {
        this.content = content;
        this.renderMarkdown(content.content);
        this.updateNavigation(content.id);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load content: ${err.message}`;
        this.loading = false;
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderMarkdown(markdown: string): void {
    const html = marked.parse(markdown) as string;
    this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private updateNavigation(currentId: string): void {
    const adjacent = this.bookLoader.getAdjacentItems(currentId);
    this.previousItem = adjacent.previous;
    this.nextItem = adjacent.next;
  }
}
