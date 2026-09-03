export interface AdminMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export interface AdminCinema {
  cinema_id: number;
  cinema_name: string;
  cinema_location: string;
  cinema_status: string;
  halls?: AdminHall[];
}

export interface AdminHall {
  hall_id: number;
  cinema_id: number;
  hall_name: string;
  hall_type: string;
  hall_status: string;
  capacity?: number;
}

export interface AdminSchedule {
  schedule_id: number;
  movie_id: number;
  hall_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  ticket_price: number;
  status: string;
  hall?: {
    hall_name: string;
    hall_type: string;
    cinema: {
      cinema_name: string;
    };
  };
}
