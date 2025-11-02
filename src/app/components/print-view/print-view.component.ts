import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { marked } from 'marked';
import { BookLoaderService } from '../../services/book-loader.service';
import { BookContent } from '../../models/book.model';

@Component({
  selector: 'app-print-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-view.component.html',
  styleUrl: './print-view.component.css'
})
export class PrintViewComponent implements OnInit, OnDestroy {
  private bookLoader = inject(BookLoaderService);
  private sanitizer = inject(DomSanitizer);
  private destroy$ = new Subject<void>();

  chapters: Array<{ title: string; html: SafeHtml }> = [];
  loading = true;
  bookTitle = '';

  ngOnInit(): void {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: false,
    });

    // Wait for manifest, then load all chapters
    this.bookLoader.manifest$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(manifest => {
      if (manifest) {
        this.bookTitle = manifest.title;

        // Get all chapter and appendix IDs
        const allIds = [
          ...manifest.chapters.map(ch => ch.id),
          ...manifest.appendices.map(app => app.id)
        ];

        // Load all content in parallel
        const loadRequests = allIds.map(id => this.bookLoader.loadContent(id));

        forkJoin(loadRequests).subscribe({
          next: (contents: BookContent[]) => {
            this.chapters = contents.map(content => ({
              title: content.title,
              html: this.renderMarkdown(content.content)
            }));
            this.loading = false;

            // Auto-trigger print dialog after content loads
            setTimeout(() => window.print(), 500);
          },
          error: (err) => {
            console.error('Failed to load all chapters:', err);
            this.loading = false;
          }
        });
      }
    });

    // Load manifest if not already loaded
    if (!this.bookLoader.getManifest()) {
      this.bookLoader.loadManifest().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderMarkdown(markdown: string): SafeHtml {
    const html = marked.parse(markdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
