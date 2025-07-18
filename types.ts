// types.ts - Add this interface
export interface BookMetadata {
  id: string;
  file_name: string;
  title: string;
  author?: string;
  tags: string[];
  cover_url?: string;
  description?: string;
  summary?: string;
  genre?: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  last_modified: string;
  download_count?: number;
  is_public: boolean;
  content_hash?: string; // For duplicate detection
  ai_processed: boolean;
  ai_metadata?: {
    extracted_summary?: string;
    detected_genre?: string;
    key_concepts?: string[];
    reading_time_minutes?: number;
  };
}
