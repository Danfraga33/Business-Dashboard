import { useState } from "react";
import { X, Plus, ChevronDown } from "lucide-react";

const timeRanges = [
  "Quarter to Date",
  "Month to Date",
  "Year to Date",
  "Last 30 Days",
  "Last 90 Days",
];

export function FunnelHeader() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Cohort"]);
  const [timeRange, setTimeRange] = useState("Quarter to Date");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  const addFilter = () => {
    const available = ["Cohort", "Offer type", "Source", "Campaign"];
    const next = available.find((f) => !activeFilters.includes(f));
    if (next) setActiveFilters([...activeFilters, next]);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => removeFilter(filter)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            {filter}
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        ))}
        <button onClick={addFilter} className="cursor-pointer h-7 rounded-full border-border bg-transparent px-3 text-[13px] text-muted-foreground hover:bg-card hover:text-foreground">
          Add Filter
        </button>
      </div>
      <div className="relative shrink-0">
        <button
          onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
        >
          {timeRange}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
        {showTimeDropdown && (
          <div className="absolute right-0 top-full z-[100] mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setShowTimeDropdown(false);
                }}
                className={`flex w-full items-center rounded-md px-3 py-2 text-[13px] transition-colors cursor-pointer ${
                  timeRange === range
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
