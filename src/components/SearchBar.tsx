import { Search, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SearchResult } from '../types';

interface SearchBarProps {
  onSearchResult: (result: SearchResult) => void;
}

export default function SearchBar({ onSearchResult }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full z-40">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a town or landmark..."
          className="w-full bg-[#1A1A1D] text-slate-200 px-10 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-emerald-500/50 transition-all text-sm placeholder:text-slate-600"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
          <Search size={16} />
        </div>
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin">
            <Loader2 size={16} />
          </div>
        )}
      </form>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar z-50">
          {results.map((res) => (
            <button
              key={res.place_id}
              onClick={() => {
                onSearchResult(res);
                setResults([]);
                setQuery(res.display_name);
              }}
              className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-start gap-3 border-b border-white/5 last:border-0 transition-colors"
            >
              <div className="text-emerald-500 mt-0.5 shrink-0">
                <MapPin size={16} />
              </div>
              <span className="text-[13px] text-slate-400 truncate leading-snug">{res.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
