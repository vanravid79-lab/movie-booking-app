import { Search } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

interface SearchMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface MovieSearchProps {
  onSearchStateChange: (searching: boolean) => void;
}

export function MovieSearch({ onSearchStateChange }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<SearchMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchQuery = query.trim();

    if (searchQuery.length < 2) {
      setMovies([]);
      setMessage("Enter at least 2 characters to search.");
      onSearchStateChange(true);
      return;
    }

    setLoading(true);
    setMessage("");
    onSearchStateChange(true);

    try {
      const response = await fetch(
        `${API_URL}/movies/search?query=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Movie search failed.");
      }

      setMovies(data.results || []);
      setMessage(data.results?.length ? "" : "No movies found.");
    } catch (error) {
      setMovies([]);
      setMessage(
        error instanceof Error ? error.message : "Movie search failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10 space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies from TMDB"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-12 pr-4 text-white outline-none transition focus:border-red-500"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-zinc-400">Searching TMDB...</p>
      ) : message ? (
        <p className="text-zinc-400">{message}</p>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="block overflow-hidden rounded-xl bg-zinc-900"
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://placehold.co/500x750?text=No+Poster"
                }
                alt={movie.title}
                className="h-96 w-full object-cover"
              />
              <div className="space-y-2 p-4">
                <h2 className="line-clamp-1 text-lg font-bold text-white">
                  {movie.title}
                </h2>
                <p className="text-xs text-zinc-400">
                  {movie.release_date || "Release date unknown"}
                </p>
                <p className="line-clamp-2 text-sm text-zinc-300">
                  {movie.overview || "No description available."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
