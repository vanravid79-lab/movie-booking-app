import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiBookmark, HiCalendar, HiClock, HiEye, HiStar } from "react-icons/hi";

// ==========================================
// TYPES
// ==========================================

interface Genre {
  id: number;
  name: string;
}

interface MovieDetailType {
  id: number;
  title: string;
  tagline: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  adult: boolean;
}

interface DateOption {
  id: string;
  label: string;
  fullDate: Date;
}

interface Session {
  scheduleId: number;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  hallName: string;
  hallType: string;
}

interface CinemaShowtime {
  cinemaId: number;
  cinemaName: string;
  cinemaLocation: string;
  sessions: Session[];
}

// ==========================================
// CONSTANTS
// ==========================================

const API_URL = "http://localhost:5059/api";
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

// ==========================================
// HELPERS
// ==========================================

const generateDates = (): DateOption[] => {
  const dates: DateOption[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    let label: string;

    if (i === 0) {
      label = `Today, ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else if (i === 1) {
      label = `Tomorrow, ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else {
      label = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    dates.push({
      id: `${year}-${month}-${day}`,
      label,
      fullDate: date,
    });
  }

  return dates;
};

const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins}min`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time: string): string => {
  if (!time) return "N/A";
  if (/^\d{2}:\d{2}/.test(time)) {
    const [hourString, minuteString] = time.split(":");
    const hour = Number(hourString);
    const minute = Number(minuteString);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ==========================================
// COMPONENT
// ==========================================

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const dates = generateDates();

  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [showtimes, setShowtimes] = useState<CinemaShowtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<DateOption>(dates[0]);
  const [activeTab, setActiveTab] = useState<"showtime" | "detail">("showtime");

  const [movieLoading, setMovieLoading] = useState(true);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [movieError, setMovieError] = useState<string | null>(null);

  // ==========================================
  // FETCH MOVIE FROM TMDB
  // ==========================================
  useEffect(() => {
    if (!id || id === "all" || id === "all1") {
      return;
    }

    const controller = new AbortController();

    const fetchMovie = async () => {
      try {
        setMovieLoading(true);
        setMovieError(null);

        const token = import.meta.env.VITE_TMDB_READ_TOKEN;
        if (!token) throw new Error("TMDB token is missing.");

        const response = await fetch(
          `${TMDB_API_URL}/movie/${id}?language=en-US`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.status_message || `Failed to fetch movie (${response.status})`,
          );
        }

        setMovie(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setMovie(null);
        setMovieError(
          error instanceof Error
            ? error.message
            : "Unable to load movie information.",
        );
      } finally {
        setMovieLoading(false);
      }
    };

    fetchMovie();

    return () => controller.abort();
  }, [id]);

  // ==========================================
  // FETCH ALL SHOWTIMES FROM BACKEND
  // ==========================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchShowtimes = async () => {
      try {
        setShowtimesLoading(true);

        const response = await fetch(
          `${API_URL}/movies/${id}?date=${selectedDate.id}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `Failed to fetch showtimes (${response.status})`,
          );
        }

        const allShowtimes: CinemaShowtime[] = data.showtimes ?? data ?? [];
        setShowtimes(allShowtimes);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setShowtimes([]);
      } finally {
        setShowtimesLoading(false);
      }
    };

    fetchShowtimes();

    return () => controller.abort();
  }, [id, selectedDate.id]);

  // ==========================================
  // RENDER LOADING / ERROR
  // ==========================================

  if (!id || id === "all" || id === "all1") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500">
        Invalid or missing Movie ID.
      </div>
    );
  }

  if (movieLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500">
        Loading movie details...
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500">
        {movieError || "Movie not found."}
      </div>
    );
  }

  // ==========================================
  // RENDER UI
  // ==========================================

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl space-y-10 p-4 pb-16 pt-8">
        {/* MOVIE HERO */}
        <section className="relative min-h-105 overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
          <div className="absolute inset-0">
            <img
              src={
                movie.backdrop_path
                  ? `${TMDB_IMAGE_URL}/original${movie.backdrop_path}`
                  : movie.poster_path
                    ? `${TMDB_IMAGE_URL}/w500${movie.poster_path}`
                    : "https://placehold.co/1200x600?text=No+Image"
              }
              alt={movie.title}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black via-black/50 to-black/40" />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-105 flex-col justify-center p-8 md:p-12">
            {movie.tagline && (
              <p className="mb-3 text-sm font-medium tracking-wide text-amber-400">
                {movie.tagline}
              </p>
            )}

            <h1 className="max-w-xl font-serif text-4xl font-bold leading-[1.05] text-white md:text-5xl">
              {movie.title}
            </h1>

            <div className="mt-6 inline-flex w-fit items-center gap-2 rounded border border-amber-400/30 bg-amber-400/5 px-3 py-1.5">
              <HiStar className="h-4 w-4 text-amber-400" />
              <span className="text-base font-semibold text-white">
                {movie.vote_average.toFixed(1)}
              </span>
              <span className="text-sm text-zinc-500">
                ({movie.vote_count.toLocaleString()} votes)
              </span>
            </div>

            <div className="mt-8 space-y-3.5 text-sm md:text-base">
              <div className="flex items-center gap-3">
                <HiBookmark className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-zinc-500">Genre</span>
                <span className="font-medium text-zinc-200">
                  {movie.genres.length > 0
                    ? movie.genres.map((genre) => genre.name).join(", ")
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <HiClock className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-zinc-500">Duration</span>
                <span className="font-medium text-zinc-200">
                  {formatRuntime(movie.runtime)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <HiCalendar className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-zinc-500">Release</span>
                <span className="font-medium text-zinc-200">
                  {formatDate(movie.release_date)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <HiEye className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-zinc-500">Rating</span>
                <span className="font-medium text-zinc-200">
                  {movie.adult ? "R18" : "G / PG"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TABS */}
        <div className="flex items-center gap-8 border-b border-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab("showtime")}
            className={`relative pb-4 text-base font-medium transition-colors ${
              activeTab === "showtime"
                ? "text-white"
                : "text-zinc-600 hover:text-zinc-300"
            }`}
          >
            Showtime
            {activeTab === "showtime" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("detail")}
            className={`relative pb-4 text-base font-medium transition-colors ${
              activeTab === "detail"
                ? "text-white"
                : "text-zinc-600 hover:text-zinc-300"
            }`}
          >
            Detail
            {activeTab === "detail" && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-amber-400" />
            )}
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "showtime" ? (
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-white">
              Showtime
            </h2>

            {/* DATE SELECTOR */}
            <div className="border-y border-zinc-900 py-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {dates.map((date) => (
                  <button
                    key={date.id}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      selectedDate.id === date.id
                        ? "bg-amber-400 font-semibold text-black shadow-lg shadow-amber-400/20"
                        : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SHOWTIMES */}
            {showtimesLoading ? (
              <div className="flex items-center justify-center py-16 text-zinc-500">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  <span>Loading showtimes...</span>
                </div>
              </div>
            ) : showtimes.length === 0 ? (
              <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 text-center text-zinc-500">
                No showtimes available for{" "}
                <span className="font-semibold text-amber-400">
                  {selectedDate.label}
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {showtimes.map((cinema) => (
                  <div
                    key={cinema.cinemaId}
                    className="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {cinema.cinemaName}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {cinema.cinemaLocation}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {cinema.sessions.map((session) => (
                        <button
                          key={session.scheduleId}
                          type="button"
                          onClick={() =>
                            navigate(`/booking/${session.scheduleId}`)
                          }
                          className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 transition-all hover:border-amber-400/50 hover:bg-amber-400/10"
                        >
                          <span className="text-base font-semibold text-amber-400">
                            {formatTime(session.startTime)}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {session.hallName} ({session.hallType})
                          </span>
                          <span className="mt-1 text-xs font-medium text-white">
                            ${Number(session.ticketPrice).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-white">
              Synopsis & Overview
            </h2>
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
              <p className="leading-relaxed text-zinc-400">
                {movie.overview || "No overview available for this movie."}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
