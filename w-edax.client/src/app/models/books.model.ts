export interface Book {
  title: string | null;
  author: string | null;
  review: string | null;
  image: string | null; // URL or path to the book's image
  metadata?: {
    publisher?: string;
    year?: number;
    genre?: string;
  };
}
