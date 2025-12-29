// Content types matching Go structs
export interface Episode {
  path: string;
  title: string;
  order: number;
  status: string;
  variants: string[];
}

export interface Week {
  path: string;
  title: string;
  order: number;
  episodes: Episode[];
}

export interface Part {
  path: string;
  title: string;
  order: number;
  weeks: Week[];
}

export interface ContentTree {
  root: string;
  parts: Part[];
}

// Git types
export interface FileStatus {
  path: string;
  status: string;
  staged: boolean;
}

export interface RepoStatus {
  branch: string;
  clean: boolean;
  ahead: number;
  behind: number;
  files: FileStatus[];
  hasRepo: boolean;
}

// Selected file
export interface SelectedFile {
  path: string;
  content: string;
  name: string;
}
