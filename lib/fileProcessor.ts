// lib/fileProcessor.ts
import { BookMetadata } from '../types';
import MetadataStore from './metadata';

export class FileProcessor {
  static async processUpload(file: File): Promise<BookMetadata> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Extract basic metadata from filename
    const basicMetadata = this.extractFromFilename(file.name);
    
    const metadata: BookMetadata = {
      id,
      file_name: file.name,
      title: basicMetadata.title || file.name.replace(/\.[^/.]+$/, ""),
      author: basicMetadata.author,
      tags: basicMetadata.tags || [],
      file_size: file.size,
      file_type: file.type || this.getFileType(file.name),
      upload_date: now,
      last_modified: now,
      is_public: false,
      ai_processed: false,
      download_count: 0
    };
    
    // Generate thumbnail if it's a PDF
    if (file.type === 'application/pdf') {
      metadata.cover_url = await this.generatePDFThumbnail(file);
    }
    
    // Save to metadata store
    await MetadataStore.add(metadata);
    
    // Queue for AI processing
    this.queueAIProcessing(metadata.id, file);
    
    return metadata;
  }
  
  private static extractFromFilename(filename: string): Partial<BookMetadata> {
    // Common patterns for occult/esoteric books
    const patterns = [
      // "Author - Title.pdf"
      /^([^-]+)\s*-\s*(.+)\.[^.]+$/,
      // "Title by Author.pdf"
      /^(.+)\s+by\s+([^.]+)\.[^.]+$/,
      // "[Author] Title.pdf"
      /^\[([^\]]+)\]\s*(.+)\.[^.]+$/
    ];
    
    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        return {
          author: match[1]?.trim(),
          title: match[2]?.trim(),
          tags: this.extractTagsFromTitle(match[2]?.trim() || '')
        };
      }
    }
    
    return {
      tags: this.extractTagsFromTitle(filename)
    };
  }
  
  private static extractTagsFromTitle(title: string): string[] {
    const tags: string[] = [];
    const keywords = [
      'alchemy', 'alchemical', 'hermetic', 'gnostic', 'kabbalah', 'kabbalistic',
      'occult', 'esoteric', 'mystical', 'magic', 'magick', 'ritual', 'tarot',
      'astrology', 'meditation', 'chakra', 'aura', 'crystal', 'divination',
      'grimoire', 'spellbook', 'witchcraft', 'wicca', 'pagan', 'druid'
    ];
    
    const lowercaseTitle = title.toLowerCase();
    keywords.forEach(keyword => {
      if (lowercaseTitle.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags;
  }
  
  private static async generatePDFThumbnail(file: File): Promise<string> {
    // This would use PDF.js or similar to generate a thumbnail
    // For now, return a placeholder
    return '/api/placeholder/thumbnail.jpg';
  }
  
  private static getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'epub': 'application/epub+zip',
      'mobi': 'application/x-mobipocket-ebook'
    };
    return typeMap[ext || ''] || 'application/octet-stream';
  }
  
  private static queueAIProcessing(bookId: string, file: File): void {
    // Queue for background AI processing
    setTimeout(() => this.processWithAI(bookId, file), 1000);
  }
  
  private static async processWithAI(bookId: string, file: File): Promise<void> {
    try {
      // Extract text content
      const textContent = await this.extractTextContent(file);
      
      // Call AI service for analysis
      const aiAnalysis = await this.analyzeWithAI(textContent);
      
      // Update metadata with AI results
      await MetadataStore.update(bookId, {
        ai_processed: true,
        ai_metadata: aiAnalysis,
        summary: aiAnalysis.extracted_summary,
        genre: aiAnalysis.detected_genre,
        tags: [...(await MetadataStore.getAll()).find(b => b.id === bookId)?.tags || [], ...aiAnalysis.key_concepts || []]
      });
      
    } catch (error) {
      console.error('AI processing failed:', error);
    }
  }
  
  private static async extractTextContent(file: File): Promise<string> {
    // Implement text extraction based on file type
    if (file.type === 'application/pdf') {
      // Use PDF.js or similar
      return 'PDF text content would be extracted here';
    }
    return file.text();
  }
  
  private static async analyzeWithAI(textContent: string): Promise<any> {
    // Call your AI service (OpenAI, Gemini, etc.)
    // This is a placeholder - implement with your chosen AI provider
    return {
      extracted_summary: 'AI-generated summary would go here',
      detected_genre: 'occult',
      key_concepts: ['hermetic', 'alchemy'],
      reading_time_minutes: Math.ceil(textContent.length / 1000)
    };
  }
}
