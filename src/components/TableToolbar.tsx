import { useEffect, useId, useState, type ReactNode } from "react";
import { Download, Filter, RefreshCw, Search } from "lucide-react";
import {
  closeFilterToolbar,
  getOpenFilterToolbarId,
  openFilterToolbar,
  subscribeFilterToolbar,
} from "@/lib/filterPanelStore";

export type TableToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Shown right after Filter; exports current table data */
  onExport?: () => void;
  exportLabel?: string;
  filterContent?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Notified when this toolbar's filter panel opens/closes */
  onFiltersOpenChange?: (open: boolean) => void;
  /** When false, Filter only toggles column filters (no toolbar panel). Default true. */
  showFilterPanel?: boolean;
};

/**
 * Accounting-style toolbar: search + Refresh + Filter before every table.
 * Only one filter panel stays open across the whole app.
 */
export function TableToolbar({
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  refreshing = false,
  onExport,
  exportLabel = "Export",
  filterContent,
  actions,
  className = "",
  onFiltersOpenChange,
  showFilterPanel = true,
}: TableToolbarProps) {
  const toolbarId = useId();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Close this panel if another page/table opens its filter
  useEffect(() => {
    const sync = () => {
      const openId = getOpenFilterToolbarId();
      const shouldOpen = openId === toolbarId;
      setShowFilters((prev) => {
        if (prev === shouldOpen) return prev;
        onFiltersOpenChange?.(shouldOpen);
        return shouldOpen;
      });
    };
    sync();
    return subscribeFilterToolbar(sync);
  }, [toolbarId, onFiltersOpenChange]);

  // Cleanup on unmount — if this toolbar had the open panel, close it
  useEffect(() => {
    return () => {
      closeFilterToolbar(toolbarId);
    };
  }, [toolbarId]);

  const setOpen = (open: boolean) => {
    if (open) {
      openFilterToolbar(toolbarId);
      setShowFilters(true);
      onFiltersOpenChange?.(true);
    } else {
      closeFilterToolbar(toolbarId);
      setShowFilters(false);
      onFiltersOpenChange?.(false);
    }
  };

  const applySearch = () => {
    onSearchChange?.(localSearch);
  };

  const resetFilters = () => {
    setLocalSearch("");
    onSearchChange?.("");
    setOpen(false);
  };

  return (
    <header className={`flex flex-col gap-2 shrink-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 w-full flex-wrap">
        <div className="relative flex items-center w-full max-w-[320px] min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            className="w-full h-7 pl-7 pr-3 text-[11px] bg-background border border-border rounded-[3px] outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap ml-auto">
          <button
            type="button"
            className="btn"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className={`btn ${showFilters ? "btn-primary" : ""}`}
            onClick={() => setOpen(!showFilters)}
            title="Filter"
          >
            <Filter className="w-3 h-3" />
            <span>Filter</span>
          </button>
          {onExport ? (
            <button type="button" className="btn" onClick={onExport} title="Export to Excel">
              <Download className="w-3 h-3" />
              <span>{exportLabel}</span>
            </button>
          ) : null}
          {actions}
        </div>
      </div>

      {showFilters && showFilterPanel && (
        <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-border w-full">
          <div className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
            {filterContent ?? (
              <div className="field min-w-[200px]">
                <label>Keyword</label>
                <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap ml-auto">
            <button type="button" className="btn" onClick={resetFilters}>
              Reset Filters
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                applySearch();
                setOpen(false);
              }}
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
