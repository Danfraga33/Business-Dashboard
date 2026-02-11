import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableCardProps {
  children: ReactNode;
  expandedContent: ReactNode;
  className?: string;
}

export function ExpandableCard({
  children,
  expandedContent,
  className = "",
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`card cursor-pointer ${className}`}
      onClick={() => setExpanded(!expanded)}
    >
      {children}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-4 border-t border-edge">{expandedContent}</div>
      </div>
      <div className="flex justify-center mt-3">
        <ChevronDown
          className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>
    </div>
  );
}
