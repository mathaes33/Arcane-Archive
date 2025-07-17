
/**
 * @file The root component of the Arcane Archives application.
 * It manages all primary state, including the book collection, search/filter criteria,
 * and modal visibility. It orchestrates the main layout and renders all sub-components.
 */
import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { Book } from '@/types';
import { BOOKS as initialBooks } from '@/constants';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { Sidebar } from '@/components/Sidebar';
import { BookCard } from '@/components/BookCard';
import { Loader } from '@/components/Loader';
import { BookDetailModal } from '@/components/BookDetailModal';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Fab } from '@/components/Fab';
import { MenuIcon } from '@/components/Icons';
import { MobileMenu } from '@/components/MobileMenu'; // New accessible mobile menu
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { analyzeText } from '@/lib/ai';

// Lazy load the ArchiveModal component to code-split its significant dependencies (like pdfjs-dist)
const ArchiveModal = React.lazy(() => import('@/components/ArchiveModal'));

/** A purely decorative background component with subtle animations. */
const Background: React.FC = () => (
  <div className="fixed inset-0 -z-10 h-full w-full bg-void">
    <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
    <div className="absolute -z-20 top-0 left-0 h-full w-full bg-gradient-to-br from-[#1e1b4b] via-void to-void animate-aurora" />
  </div>
);

const USER_BOOKS_KEY = 'arcane_archives_user_books';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal visibility states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const areModalsOpen = !!selectedBook || isArchiveModalOpen;

  // --- EFFECTS ---

  // Effect for initializing the app: loading books and removing the initial loader
  useEffect(() => {
    try {
        // User-added books are stored in localStorage to persist across sessions
        const storedBooksJSON = localStorage.getItem(USER_BOOKS_KEY);
        const userBooks = storedBooksJSON ? JSON.parse(storedBooksJSON) : [];
        setBooks([...initialBooks, ...userBooks]);
    } catch (error) {
        console.error("Failed to load user books from localStorage:", error);
        setBooks(initialBooks); // Fallback to initial books on error
    }
    
    setLoading(false);
    // Remove the 'no-flash' class to fade in the loaded app
    document.body.classList.add('loaded');
    document.body.classList.remove('no-flash');
  }, []);
  
  // --- MEMOIZED VALUES ---

  // Memoized list of all unique categories derived from the books
  const categories = useMemo(() => {
    const allTags = new Set(books.flatMap(book => book.tags));
    return ["All", ...Array.from(allTags)].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b));
  }, [books]);

  // Memoized Fuse.js instance for efficient fuzzy searching
  const fuse = useMemo(() => new Fuse(books, {
      keys: ['title', 'author', 'tags'],
      includeScore: true,
      threshold: 0.4,
      minMatchCharLength: 2,
      ignoreLocation: true,
  }), [books]);

  // Memoized list of books to display based on current search and filter criteria
  const filteredBooks = useMemo(() => {
      // Start with all books or fuzzy search results
      const baseResults = searchTerm.trim()
          ? fuse.search(searchTerm).map(result => result.item)
          : books;

      // Then, filter by category if one is selected
      if (selectedCategory === 'All') {
          return baseResults;
      }
      return baseResults.filter(book => book.tags.includes(selectedCategory));

  }, [searchTerm, selectedCategory, books, fuse]);

  // --- CALLBACKS ---

  // Callbacks for opening and closing modals, memoized for performance
  const handleBookModalClose = useCallback(() => setSelectedBook(null), []);
  const handleArchiveModalOpen = useCallback(() => setIsArchiveModalOpen(true), []);
  const handleArchiveModalClose = useCallback(() => setIsArchiveModalOpen(false), []);
  const handleMenuOpen = useCallback(() => setIsMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);

  /**
   * Handles the archiving process: calls the AI, creates a new book object,
   * and updates both the component state and localStorage.
   */
  const handleArchive = useCallback(async (textContent: string) => {
      const newBookData = await analyzeText(textContent);

      const newBook: Book = {
          ...newBookData,
          id: crypto.randomUUID(), // Use crypto.randomUUID for a robust, unique ID
          coverImage: `https://picsum.photos/seed/${newBookData.title.replace(/\s+/g, '-')}/400/600`,
          fileUrl: '#', // Archived books have text content, not a file URL
          textContent: textContent,
      };
      
      // Update the main books state to include the new book
      setBooks(prevBooks => [...prevBooks, newBook]);

      // Update the user-specific book list in localStorage
      try {
          const currentStoredJSON = localStorage.getItem(USER_BOOKS_KEY);
          const userBooks = currentStoredJSON ? JSON.parse(currentStoredJSON) : [];
          const updatedUserBooks = [...userBooks, newBook];
          localStorage.setItem(USER_BOOKS_KEY, JSON.stringify(updatedUserBooks));
      } catch (error) {
          console.error("Failed to save new book to localStorage:", error);
          // Note: The app state is still updated, so the user sees the new book.
          // The error only affects persistence for the next session.
      }
  }, []);

  // --- RENDER ---

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Background />
      <div className="relative min-h-screen px-4 sm:px-6 lg:px-8">
        <Header />
        
        <main className="container mx-auto max-w-screen-2xl">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Sidebar */}
                {isDesktop && (
                    <aside className="w-full lg:w-64 lg:flex-shrink-0">
                        <div className="lg:sticky lg:top-8 bg-black/20 backdrop-blur-md border border-gold-900/30 rounded-lg">
                            <Sidebar 
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                            />
                        </div>
                    </aside>
                )}
                
                <div className="flex-1">
                    {/* Mobile Category Header & Menu Button */}
                    {!isDesktop && (
                        <div className="flex justify-between items-center mb-4 p-2 bg-black/20 border border-gold-900/30 rounded-lg">
                            <h2 className="font-serif text-lg text-gold-300 tracking-wider">Library</h2>
                            <button 
                                onClick={handleMenuOpen}
                                className="p-2 text-gold-300 hover:text-gold-100 transition-colors"
                                aria-label="Open categories menu"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                    {filteredBooks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredBooks.map(book => (
                          <BookCard key={book.id} book={book} onViewDetails={setSelectedBook} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-black/20 rounded-lg border border-gold-900/30">
                        <p className="text-xl text-stone-400 font-serif">No manuscripts found.</p>
                        <p className="mt-2 text-stone-500">Adjust your search or filter.</p>
                      </div>
                    )}
                </div>
            </div>
        </main>

        <footer className="text-center py-12 mt-16 text-sm text-stone-500 font-sans">
            <p>&copy; {new Date().getFullYear()} Arcane Archives. For educational and esoteric pursuits only.</p>
        </footer>
      </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
          {selectedBook && (
              <BookDetailModal book={selectedBook} onClose={handleBookModalClose} />
          )}
          {isArchiveModalOpen && (
              <Suspense fallback={<div className="fixed inset-0 bg-void/50 z-50" />}>
                <ArchiveModal 
                    onClose={handleArchiveModalClose}
                    onArchive={handleArchive}
                />
              </Suspense>
          )}
      </AnimatePresence>
      
      {/* The MobileMenu now lives outside the main AnimatePresence block to manage its own lifecycle */}
      <MobileMenu isOpen={!isDesktop && isMenuOpen} onClose={handleMenuClose}>
        <Sidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onClose={handleMenuClose}
        />
      </MobileMenu>

      {/* Floating Action Buttons */}
      <Fab onClick={handleArchiveModalOpen} label="Archive New Manuscript" isVisible={!areModalsOpen} />
      <ScrollToTop isVisible={!areModalsOpen} />
    </>
  );
}