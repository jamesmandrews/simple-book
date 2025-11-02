export interface Chapter {
  id: string;
  title: string;
  file: string;
  part?: string;
  order: number;
}

export interface Appendix {
  id: string;
  title: string;
  file: string;
  order: number;
}

export interface BookManifest {
  title: string;
  author?: string;
  version?: string;
  description?: string;
  chapters: Chapter[];
  appendices: Appendix[];
}

export interface BookContent {
  id: string;
  title: string;
  content: string;
  type: 'chapter' | 'appendix';
}

export interface NavigationItem {
  id: string;
  title: string;
  route: string;
  type: 'chapter' | 'appendix';
  part?: string;
  order: number;
}
