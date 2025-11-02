import { Component, OnInit, OnDestroy, inject, ElementRef, Renderer2, AfterViewChecked } from '@angular/core';
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
export class PrintViewComponent implements OnInit, OnDestroy, AfterViewChecked {
  private bookLoader = inject(BookLoaderService);
  private sanitizer = inject(DomSanitizer);
  private elRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private destroy$ = new Subject<void>();
  private copyButtonsAdded = false;

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

  ngAfterViewChecked(): void {
    if (this.chapters.length > 0 && !this.copyButtonsAdded) {
      this.addCopyButtons();
      this.copyButtonsAdded = true;
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

  private addCopyButtons(): void {
    const codeBlocks = this.elRef.nativeElement.querySelectorAll('.markdown-content pre code');

    codeBlocks.forEach((codeElement: HTMLElement) => {
      const preElement = codeElement.parentElement;
      if (!preElement || preElement.querySelector('.copy-code-btn')) return;

      // Create copy button
      const copyButton = this.renderer.createElement('button');
      this.renderer.addClass(copyButton, 'copy-code-btn');
      this.renderer.setAttribute(copyButton, 'aria-label', 'Copy code');
      this.renderer.setProperty(copyButton, 'innerHTML', '📋');

      // Add click handler
      this.renderer.listen(copyButton, 'click', () => {
        const code = codeElement.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
          // Show feedback
          this.renderer.setProperty(copyButton, 'innerHTML', '✓');
          this.renderer.addClass(copyButton, 'copied');

          setTimeout(() => {
            this.renderer.setProperty(copyButton, 'innerHTML', '📋');
            this.renderer.removeClass(copyButton, 'copied');
          }, 2000);
        });
      });

      // Add button to pre element
      this.renderer.appendChild(preElement, copyButton);
    });
  }
}
