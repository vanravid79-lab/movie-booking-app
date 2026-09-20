import { Navbar, NavbarCollapse, NavbarToggle } from "flowbite-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { IoSearchSharp } from "react-icons/io5";
import { LuTicket } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

interface SearchMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface CurrentUser {
  name?: string;
  role?: string;
}

const getStoredUser = (): CurrentUser | null => {
  const userStr = localStorage.getItem("cambo_user");

  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr) as CurrentUser;
  } catch {
    return null;
  }
};

export function NavbarCom() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    getStoredUser,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchMovie[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const syncUser = () => {
    setCurrentUser(getStoredUser());
  };

  useEffect(() => {
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("cambo_token");
    localStorage.removeItem("cambo_user");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchMessage("Enter at least 2 characters.");
      return;
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchMessage("");

      try {
        const response = await fetch(
          `${API_URL}/movies/search?query=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Movie search failed.");
        }

        setSearchResults((data.results || []).slice(0, 5));
        setSearchMessage(data.results?.length ? "" : "No movies found.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSearchResults([]);
        setSearchMessage(
          error instanceof Error ? error.message : "Movie search failed.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearchMessage("");
      setSearching(false);
    }
  };

  const handleMovieSelect = (movieId: number) => {
    setSearchResults([]);
    setSearchMessage("");
    navigate(`/movie/${movieId}`);
  };

  const searchResultsPanel = (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-1 shadow-2xl shadow-black/40 backdrop-blur">
      {searching ? (
        <p className="px-4 py-3 text-sm text-zinc-400">Searching TMDB...</p>
      ) : searchMessage ? (
        <p className="px-4 py-3 text-sm text-zinc-400">{searchMessage}</p>
      ) : (
        searchResults.map((movie) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => handleMovieSelect(movie.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-zinc-800"
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                  : "https://placehold.co/46x68?text=N/A"
              }
              alt=""
              className="h-12 w-9 rounded object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {movie.title}
              </span>
              <span className="text-xs text-zinc-500">
                {movie.release_date || "Release date unknown"}
              </span>
            </span>
          </button>
        ))
      )}
    </div>
  );

  return (
    <Navbar
      fluid
      rounded={false}
      className="sticky top-0 z-50 w-full shrink-0 bg-[#27272a]! px-6 py-4"
    >
      <div className="flex w-full items-center justify-between gap-6">
        {/* Left: Search input */}
        <div className="relative hidden md:block md:w-64">
          <form
            onSubmit={handleSearch}
            className="flex items-center justify-between gap-2 rounded-full border border-gray-600 bg-transparent py-2 pl-5 pr-2"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchQueryChange(event.target.value)}
              placeholder="Search Movies..."
              className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Search movies"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300 hover:text-white"
            >
              <IoSearchSharp className="h-4 w-4" />
            </button>
          </form>
          {(searching || searchMessage || searchResults.length > 0) &&
            searchResultsPanel}
        </div>

        {/* Center: Logo */}
        <Link to="/" className="mx-auto flex items-center md:mx-0">
          <span className="text-xl font-extrabold uppercase tracking-widest text-white">
            Cambo Movie
          </span>
        </Link>

        {/* Right: Ticket, User Profile / Admin / Login, Notification */}
        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="hidden items-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white transition hover:border-white md:flex"
          >
            <LuTicket className="h-4 w-4" />
            <span>Ticket</span>
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === "admin" && (
                <Link
                  to="/admin/schedules"
                  className="rounded-full bg-amber-600/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-600/30 transition"
                >
                  Admin Panel
                </Link>
              )}

              {/* Profile Link Button */}
              <Link
                to="/user"
                title="View Personal Profile"
                className="flex items-center gap-2 rounded-full bg-linear-to-br from-red-800 to-red-950 px-3.5 py-1.5 text-xs font-semibold text-gray-100 transition hover:from-red-700 hover:to-red-900 border border-red-500/30"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white uppercase">
                  {currentUser.name ? currentUser.name.charAt(0) : "U"}
                </div>
                <span>{currentUser.name}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-red-400 hover:border-zinc-500 transition"
              >
                <FiLogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
            >
              <FaRegUser className="h-3 w-3" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/notification"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition hover:border-white"
          >
            <IoNotificationsOutline className="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <NavbarToggle className="text-gray-300 md:hidden" />
      </div>

      {/* Mobile collapse */}
      <NavbarCollapse className="md:hidden">
        <div className="relative mt-2">
          <form
            onSubmit={handleSearch}
            className="flex items-center justify-between gap-2 rounded-full border border-gray-600 px-5 py-2"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchQueryChange(event.target.value)}
              placeholder="Search Movies..."
              className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Search movies"
              className="text-gray-300 hover:text-white"
            >
              <IoSearchSharp className="h-4 w-4" />
            </button>
          </form>
          {(searching || searchMessage || searchResults.length > 0) &&
            searchResultsPanel}
        </div>

        <Link
          to="/tickets"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white"
        >
          <LuTicket className="h-4 w-4" />
          <span>Ticket</span>
        </Link>

        {currentUser ? (
          <>
            <Link
              to="/user"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-zinc-800 border border-zinc-700 px-5 py-2 text-sm font-medium text-white"
            >
              <FaRegUser className="h-4 w-4 text-red-500" />
              <span>Profile: {currentUser.name}</span>
            </Link>

            {currentUser.role === "admin" && (
              <Link
                to="/admin/schedules"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-amber-600/20 border border-amber-500/40 px-5 py-2 text-sm font-medium text-amber-300"
              >
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-red-500 px-5 py-2 text-sm font-medium text-red-400"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white"
          >
            <FaRegUser className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        )}
      </NavbarCollapse>
    </Navbar>
  );
}
