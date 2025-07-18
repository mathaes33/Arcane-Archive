// lib/metadata.ts
import { BookMetadata } from '../types';

class MetadataStore {
  private static STORAGE_KEY = 'arcane_archive_metadata';
  
  static async getAll(): Promise<BookMetadata[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading metadata:', error);
      return [];
    }
  }
  
  static async save(metadata: BookMetadata[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }
  
  static async add(book: BookMetadata): Promise<void> {
    const books = await this.getAll();
    books.push(book);
    await this.save(books);
  }
  
  static async update(id: string, updates: Partial<BookMetadata>): Promise<void> {
    const books = await this.getAll();
    const index = books.findIndex(book => book.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...updates };
      await this.save(books);
    }
  }
  
  static async delete(id: string): Promise<void> {
    const books = await this.getAll();
    const filtered = books.filter(book => book.id !== id);
    await this.save(filtered);
  }
  
  static async search(query: string, filters?: {
    tags?: string[];
    genre?: string;
    author?: string;
  }): Promise<BookMetadata[]> {
    const books = await this.getAll();
    const lowercaseQuery = query.toLowerCase();
    
    return books.filter(book => {
      // Text search
      const matchesQuery = !query || 
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author?.toLowerCase().includes(lowercaseQuery) ||
        book.description?.toLowerCase().includes(lowercaseQuery) ||
        book.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      
      // Filter by tags
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => book.tags.includes(tag));
      
      // Filter by genre
      const matchesGenre = !filters?.genre || book.genre === filters.genre;
      
      // Filter by author
      const matchesAuthor = !filters?.author || book.author === filters.author;
      
      return matchesQuery && matchesTags && matchesGenre && matchesAuthor;
    });
  }
}

export default MetadataStore;
