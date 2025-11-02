import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '.markdown-content',
  standalone: true
})
export class CodeCopyDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    // Find all pre > code elements and add copy buttons
    const codeBlocks = this.el.nativeElement.querySelectorAll('pre code');

    codeBlocks.forEach((codeElement: HTMLElement) => {
      const preElement = codeElement.parentElement;
      if (!preElement) return;

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
