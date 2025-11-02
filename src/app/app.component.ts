import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookNavigationComponent } from './components/book-navigation/book-navigation.component';
import { BookLoaderService } from './services/book-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BookNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private bookLoader = inject(BookLoaderService);

  ngOnInit(): void {
    // Load the book manifest on app initialization
    this.bookLoader.loadManifest().subscribe({
      next: (manifest) => {
        console.log('Book loaded:', manifest.title);
      },
      error: (err) => {
        console.error('Failed to load book manifest:', err);
      }
    });
  }
}
