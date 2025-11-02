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
    path: 'print',
    loadComponent: () => import('./components/print-view/print-view.component').then(m => m.PrintViewComponent)
  },
  {
    path: '**',
    redirectTo: '/chapter/chapter01'
  }
];
