import React, { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";

export interface Column<T> {
  /** Unique key for the column, also used to read the row value if `accessor` is omitted. */
  key: keyof T & string;
  /** Column header label. */
  header: string;
  /** Custom cell renderer; falls back to `row[key]` when omitted. */
  render?: (row: T) => React.ReactNode;
  /** Whether this column can be sorted. Defaults to true. */
  sortable?: boolean;
  /** Optional column width, e.g. "120px" or "20%". */
  width?: string;
  /** Text alignment for header + cells. Defaults to "left". */
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Unique row identifier accessor. Defaults to using row index. */
  getRowId?: (row: T) => string | number;
  /** Placeholder text for the built-in search box. Omit to hide search. */
  searchPlaceholder?: string;
  /** Fields to match against when searching. Defaults to all column keys. */
  searchableKeys?: (keyof T & string)[];
  /** Rows per page. Defaults to 8. */
  pageSize?: number;
  /** Shown when there are no rows to display. */
  emptyMessage?: string;
  /** Called when a row is clicked. */
  onRowClick?: (row: T) => void;
}

type SortDirection = "asc" | "desc" | null;

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  getRowId,
  searchPlaceholder = "Search...",
  searchableKeys,
  pageSize = 8,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const keys = searchableKeys ?? columns.map((c) => c.key);
    const q = query.toLowerCase();
    return data.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query, searchableKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSort = (col: Column<T>) => {
    if (col.sortable === false) return;
    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
    setPage(1);
  };

  const alignClass = (align?: "left" | "center" | "right") =>
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Search */}
      {searchPlaceholder && (
        <div className="p-3 border-b border-slate-200">
          <div className="relative max-w-xs">
            <Search
              size={15}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-2.5 font-medium text-slate-500 select-none ${alignClass(
                      col.align,
                    )} ${col.sortable !== false ? "cursor-pointer" : ""}`}
                    onClick={() => handleSort(col)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable !== false &&
                        (isSorted && sortDir === "asc" ? (
                          <ChevronUp size={13} className="text-rose-600" />
                        ) : isSorted && sortDir === "desc" ? (
                          <ChevronDown size={13} className="text-rose-600" />
                        ) : (
                          <ChevronsUpDown
                            size={13}
                            className="text-slate-300"
                          />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={getRowId ? getRowId(row) : i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-slate-100 last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 text-slate-700 ${alignClass(
                        col.align,
                      )}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md px-2.5 py-1 text-xs text-slate-600 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-xs text-slate-500">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md px-2.5 py-1 text-xs text-slate-600 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
