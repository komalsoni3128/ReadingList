import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Library, Search, AlertCircle } from 'lucide-react';

type Status = 'want-to-read' | 'reading' | 'finished';

interface Book {
  id: string;
  title: string;
  status: Status;
}

const STATUS_META: Record<Status, { label: string; dot: string; badge: string }> = {
  'want-to-read': {
    label: 'Want to Read',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  reading: {
    label: 'Reading',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  finished: {
    label: 'Finished',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const ALL_STATUSES: Status[] = ['want-to-read', 'reading', 'finished'];

const STORAGE_KEY = 'reading-list-books';

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Book[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('want-to-read');
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim().replace(/\s+/g, ' ');
    if (!trimmed) return;
    if (trimmed.length > 60) {
      setError('Book title must be 60 characters or fewer.');
      return;
    }
    const exists = books.some(
      (b) => b.title.trim().replace(/\s+/g, ' ').toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError('This book is already in your reading list.');
      return;
    }
    setError('');
    setBooks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: trimmed, status },
    ]);
    setTitle('');
    setStatus('want-to-read');
  };

  const changeStatus = (id: string, next: Status) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: next } : b))
    );
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const visibleBooks =
    filter === 'all' ? books : books.filter((b) => b.status === filter);

  const counts = {
    all: books.length,
    'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
    reading: books.filter((b) => b.status === 'reading').length,
    finished: books.filter((b) => b.status === 'finished').length,
  };

  const filterTabs: { key: Status | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'want-to-read', label: 'Want to Read' },
    { key: 'reading', label: 'Reading' },
    { key: 'finished', label: 'Finished' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900 text-white">
            <Library size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Reading List</h1>
            <p className="text-xs text-stone-500">
              Track the books you want to read
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Add book form */}
        <form
          onSubmit={addBook}
          className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3 text-stone-700">
            <Plus size={18} />
            <h2 className="font-semibold text-sm">Add a book</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Book title"
              className="flex-1 rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 placeholder:text-stone-400"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 bg-white"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add to list
          </button>

          {error && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </p>
          )}
        </form>

        {/* Summary */}
        {books.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-stone-900">{counts.all}</p>
              <p className="text-xs text-stone-500 mt-1">Total Books</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-sky-600">{counts.reading}</p>
              <p className="text-xs text-stone-500 mt-1">Currently Reading</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-emerald-600">{counts.finished}</p>
              <p className="text-xs text-stone-500 mt-1">Finished</p>
            </div>
          </div>
        )}

        {/* Filters */}
        {books.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={
                    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ' +
                    (active
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900')
                  }
                >
                  {tab.label}
                  <span
                    className={
                      'inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs ' +
                      (active
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 text-stone-500')
                    }
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Book list / Empty states */}
        <div className="mt-6">
          {books.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 py-16 px-6 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 text-stone-400">
                <BookOpen size={26} />
              </div>
              <p className="text-stone-600 font-medium">
                Your reading list is empty. Add your first book.
              </p>
            </div>
          ) : visibleBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 py-16 px-6 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 text-stone-400">
                <Search size={26} />
              </div>
              <p className="text-stone-600 font-medium">
                No books in this category.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {visibleBooks.map((book) => {
                const meta = STATUS_META[book.status];
                return (
                  <li
                    key={book.id}
                    className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-stone-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className={
                            'mt-1.5 inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ' +
                            meta.dot
                          }
                        />
                        <h3 className="font-semibold text-sm leading-snug break-words">
                          {book.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeBook(book.id)}
                        aria-label="Delete book"
                        className="flex-shrink-0 rounded-lg p-1.5 text-stone-300 transition hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ' +
                          meta.badge
                        }
                      >
                        <span
                          className={'w-1.5 h-1.5 rounded-full ' + meta.dot}
                        />
                        {meta.label}
                      </span>

                      <select
                        value={book.status}
                        onChange={(e) =>
                          changeStatus(book.id, e.target.value as Status)
                        }
                        className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600 outline-none transition hover:border-stone-300 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => removeBook(book.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-500 transition hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
