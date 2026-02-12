import { useState } from "react";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  defaultTab?: number;
}

export function Tabs({ children, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-edge mb-6">
        <div className="flex gap-6">
          {children.map((child, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === index
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {child.props.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>{children[activeTab]}</div>
    </div>
  );
}
