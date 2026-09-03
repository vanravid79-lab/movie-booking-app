import type { AdminSchedule, AdminCinema } from "../types/admin.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

export interface SchedulePayload {
  movie_id: number;
  hall_id: number;
  schedule_date: string; // Format: YYYY-MM-DD
  start_time: string; // Format: HH:mm:ss
  end_time: string; // Format: HH:mm:ss
  ticket_price: number;
  status?: string; // e.g., "Scheduled"
}

export const adminApi = {
  // Fetch all cinemas for dropdown selectors
  async getCinemas() {
    const response = await fetch(`${API_URL}/admin/cinemas`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch cinemas");
    return data;
  },

  // Fetch halls belonging to a specific cinema
  async getHalls(cinemaId: number) {
    const response = await fetch(`${API_URL}/admin/cinemas/${cinemaId}/halls`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch halls");
    return data;
  },

  // Create a new movie showtime/schedule
  async createSchedule(payload: SchedulePayload) {
    const response = await fetch(`${API_URL}/admin/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to create schedule");
    }
    return data;
  },

  // Fetch all schedules for admin overview
  async getSchedules() {
    const response = await fetch(`${API_URL}/admin/schedules`);
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to fetch schedules");
    return data;
  },

  // Delete or cancel a schedule
  async deleteSchedule(scheduleId: number) {
    const response = await fetch(`${API_URL}/admin/schedules/${scheduleId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to delete schedule");
    return data;
  },
};
