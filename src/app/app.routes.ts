import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/chapter/chapter01',
    pathMatch: 'full'
  },
  {
    path: 'chapter/:id',
    loadComponent: () => import('./components/chapter-viewer/chapter-viewer.component').then(m => m.ChapterViewerComponent)
  },
  {
    path: 'appendix/:id',
    loadComponent: () => import('./components/chapter-viewer/chapter-viewer.component').then(m => m.ChapterViewerComponent)
  },
  {
    path: '**',
    redirectTo: '/chapter/chapter01'
  }
];
