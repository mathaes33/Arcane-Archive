import React from 'react';
import { BookMetadata } from '../types';

interface BookCardProps {
  book: BookMetadata;
  onDownload: (book: BookMetadata) => void;
  onDelete: (book: BookMetadata) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDownload, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Cover thumbnail */}
        <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded" />
          ) : (
            <span className="text-gray-400 text-xs">📖</span>
          )}
        </div>
        
        {/* Book info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{book.title}</h3>
          {book.author && (
            <p className="text-gray-600 text-sm">by {book.author}</p>
          )}
          {book.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{book.description}</p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {book.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{(book.file_size / 1024 / 1024).toFixed(1)} MB</span>
            <span>{book.file_type}</span>
            {book.ai_processed && <span className="text-green-600">✨ AI Enhanced</span>}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onDownload(book)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Download
          </button>
          <button
            onClick={() => onDelete(book)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
