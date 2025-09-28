export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  description?: string;
}