import { Component, OnInit, OnDestroy, inject, ElementRef, Renderer2, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, switchMap, filter, combineLatest, take } from 'rxjs';
import { marked } from 'marked';
import { BookLoaderService } from '../../services/book-loader.service';
import { BookContent, NavigationItem } from '../../models/book.model';

@Component({
  selector: 'app-chapter-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chapter-viewer.component.html',
  styleUrl: './chapter-viewer.component.css'
})
export class ChapterViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private bookLoader = inject(BookLoaderService);
  private sanitizer = inject(DomSanitizer);
  private elRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private destroy$ = new Subject<void>();
  private copyButtonsAdded = false;

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

  ngAfterViewChecked(): void {
    if (this.renderedHtml && !this.copyButtonsAdded) {
      this.addCopyButtons();
      this.copyButtonsAdded = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderMarkdown(markdown: string): void {
    const html = marked.parse(markdown) as string;
    this.renderedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.copyButtonsAdded = false; // Reset flag when new content is rendered
  }

  private updateNavigation(currentId: string): void {
    const adjacent = this.bookLoader.getAdjacentItems(currentId);
    this.previousItem = adjacent.previous;
    this.nextItem = adjacent.next;
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
