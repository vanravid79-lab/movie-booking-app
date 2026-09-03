import React, { useMemo, useState } from "react";
import "./App.css";

import { MovieCard } from "./component/movieCard";
import UpcomingMovie from "./component/upcoming";

export type TabType = "now-showing" | "coming-soon";

export interface DateOption {
  id: string; // ISO format ("YYYY-MM-DD" or "YYYY-MM")
  label: string; // Display format ("Today, Aug 31" or "August 2026")
}

// Helper: Format local Date object to "YYYY-MM-DD" without UTC shifting
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Generates consecutive days starting from today in local time
const getNowShowingDates = (daysCount: number = 7): DateOption[] => {
  const dates: DateOption[] = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(today);
    current.setDate(today.getDate() + i);

    const id = formatLocalDate(current);

    const monthDay = current.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    if (i === 0) {
      dates.push({ id, label: `Today, ${monthDay}` });
    } else {
      const weekday = current.toLocaleDateString("en-US", { weekday: "short" });
      dates.push({ id, label: `${weekday}, ${monthDay}` });
    }
  }

  return dates;
};

// Generates months starting from current month
const getComingSoonMonths = (): DateOption[] => {
  const months: DateOption[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const startMonth = today.getMonth();

  const totalMonths = Math.max(12 - startMonth, 6);

  for (let i = 0; i < totalMonths; i++) {
    const date = new Date(currentYear, startMonth + i, 1);

    const year = date.getFullYear();
    const monthNum = String(date.getMonth() + 1).padStart(2, "0");
    const id = `${year}-${monthNum}`;

    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    months.push({ id, label });
  }

  return months;
};

export const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>("now-showing");

  const nowShowingDates = useMemo(() => getNowShowingDates(7), []);
  const comingSoonMonths = useMemo(() => getComingSoonMonths(), []);

  const [selectedDate, setSelectedDate] = useState<DateOption>(
    nowShowingDates[0],
  );

  const currentDates =
    activeTab === "now-showing" ? nowShowingDates : comingSoonMonths;

  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    setSelectedDate(
      tab === "now-showing" ? nowShowingDates[0] : comingSoonMonths[0],
    );
  };

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-12">
      <section className="mx-auto max-w-4xl">
        {/* Banner */}
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1920"
            alt="Cinema Hero Banner"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-5 text-2xl font-semibold sm:text-3xl">
          <button
            type="button"
            onClick={() => handleTabChange("now-showing")}
            className={`transition-colors duration-200 focus:outline-none ${
              activeTab === "now-showing"
                ? "font-bold text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Now Showing
          </button>

          <span className="inline-block h-6 w-[1px] bg-zinc-700" />

          <button
            type="button"
            onClick={() => handleTabChange("coming-soon")}
            className={`transition-colors duration-200 focus:outline-none ${
              activeTab === "coming-soon"
                ? "font-bold text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Horizontal Date/Month Selector */}
        <div className="mt-6 border-t border-zinc-800/80 pt-6">
          <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
            {currentDates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDate(item)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  selectedDate.id === item.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Movies Grid Section */}
      <section className="mx-auto mt-10 max-w-7xl">
        {activeTab === "now-showing" ? (
          <MovieCard selectedDate={selectedDate.id} />
        ) : (
          <UpcomingMovie selectedMonth={selectedDate.id} />
        )}
      </section>
    </main>
  );
};

export default App;
