import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface MovieCardProps {
  selectedDate: string; // "YYYY-MM-DD"
}

interface AllMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface TMDBData {
  results: AllMovie[];
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function MovieCard({ selectedDate }: MovieCardProps) {
  const [movies, setMovies] = useState<AllMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);
    const controller = new AbortController();
    const token = import.meta.env.VITE_TMDB_READ_TOKEN;

    // Look back 60 days to catch popular movies currently in theaters
    const [y, m, d] = selectedDate.split("-").map(Number);
    const targetDate = new Date(y, m - 1, d);
    targetDate.setDate(targetDate.getDate() - 60);

    const gteDate = formatLocalDate(targetDate);

    // Filter by high popularity and minimum vote count
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&vote_count.gte=100&primary_release_date.gte=${gteDate}&primary_release_date.lte=${selectedDate}`;

    fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("TMDB Response Error");
        return res.json();
      })
      .then((data: TMDBData) => {
        setMovies(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("TMDB Fetch Error:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex h-48 items-center justify-center text-zinc-400">
          Loading popular movies...
        </div>
      ) : movies.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-zinc-400">
          No famous movies found for this period.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.map((item) => (
            <Link key={item.id} to={`/movie/${item.id}`} className="block">
              <Card
                className="max-w-sm overflow-hidden border-zinc-800 bg-zinc-900 transition-transform duration-200 hover:-translate-y-1"
                renderImage={() => (
                  <div className="relative">
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                          : "https://placehold.co/500x750?text=No+Poster"
                      }
                      alt={item.title}
                      className="h-96 w-full object-cover"
                    />
                    {item.vote_average > 0 && (
                      <span className="absolute right-2 top-2 rounded-full bg-black/80 px-2 py-1 text-xs font-semibold text-yellow-400">
                        ★ {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}
              >
                <h5 className="line-clamp-1 text-xl font-bold tracking-tight text-white">
                  {item.title}
                </h5>
                <p className="text-xs font-semibold text-zinc-400">
                  Release: {item.release_date || "N/A"}
                </p>
                <p className="line-clamp-3 text-sm font-normal text-zinc-300">
                  {item.overview || "No description available."}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieCard;
