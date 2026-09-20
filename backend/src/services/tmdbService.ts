import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_READ_TOKEN = process.env.TMDB_READ_TOKEN;

const getTMDBConfig = () => ({
  headers: TMDB_READ_TOKEN
    ? {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_READ_TOKEN}`,
      }
    : undefined,
  params: TMDB_READ_TOKEN ? undefined : { api_key: TMDB_API_KEY },
});

export const searchTMDBMovies = async (query: string) => {
  if (!TMDB_READ_TOKEN && !TMDB_API_KEY) {
    throw new Error("TMDB credentials are not configured");
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      ...getTMDBConfig(),
      params: {
        ...getTMDBConfig().params,
        query,
        include_adult: false,
        language: "en-US",
        page: 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error("TMDB movie search error:", error);
    throw new Error("Failed to search movies from TMDB");
  }
};

// Fetch details for a specific movie by ID
export const getTMDBMovieDetails = async (movieId: number) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      ...getTMDBConfig(),
      params: {
        ...getTMDBConfig().params,
        language: "en-US",
      },
    });
    return response.data;
  } catch (error) {
    console.error("TMDB API Error:", error);
    throw new Error("Failed to fetch movie data from TMDB");
  }
};
