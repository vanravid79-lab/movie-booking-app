import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY; // Add TMDB_API_KEY to your .env file

// Fetch details for a specific movie by ID
export const getTMDBMovieDetails = async (movieId: number) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
      },
    });
    return response.data;
  } catch (error) {
    console.error("TMDB API Error:", error);
    throw new Error("Failed to fetch movie data from TMDB");
  }
};
