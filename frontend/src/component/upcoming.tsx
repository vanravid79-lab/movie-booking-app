import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface UpcomingMovieProps {
  selectedMonth: string; // "YYYY-MM"
}

interface MovieUpComing {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface UpComingTMDBRes {
  results: MovieUpComing[];
}

const getMonthDateRange = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = `${yearMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
};

export function UpcomingMovie({ selectedMonth }: UpcomingMovieProps) {
  const [upComingMov, setUpComingMov] = useState<MovieUpComing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!selectedMonth) return;

    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    const controller = new AbortController();
    const token = import.meta.env.VITE_TMDB_READ_TOKEN;

    const { startDate, endDate } = getMonthDateRange(selectedMonth);

    // Fetch upcoming movies sorted by highest popularity
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}`;

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
      .then((items: UpComingTMDBRes) => {
        setUpComingMov(items.results || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Upcoming Movies Fetch Error:", err);
          setLoading(false);
        }
      });

    return () => {
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex h-48 items-center justify-center text-zinc-400">
          Loading upcoming blockbusters...
        </div>
      ) : upComingMov.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-zinc-400">
          No major movies scheduled for this month.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {upComingMov.map((item) => (
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

export default UpcomingMovie;
