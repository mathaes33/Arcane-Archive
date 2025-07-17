
export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  tags: string[];
  description: string;
  coverImage: string;
  fileUrl: string;
  textContent?: string;
}
