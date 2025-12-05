"use client";

import { cn } from "@/lib/cn";

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "underline" | "pills";
  color?: "green" | "yellow" | "purple" | "gray";
}

const underlineColors = {
  green: "border-green-600 text-green-600",
  yellow: "border-yellow-600 text-yellow-600",
  purple: "border-purple-600 text-purple-600",
  gray: "border-gray-600 text-gray-600",
};

const pillColors = {
  green: "bg-green-100 text-green-800 border-2 border-green-300",
  yellow: "bg-yellow-100 text-yellow-800 border-2 border-yellow-300",
  purple: "bg-purple-100 text-purple-800 border-2 border-purple-300",
  gray: "bg-gray-200 text-gray-800 border-2 border-gray-400",
};

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  color = "green",
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === tab.id
                ? pillColors[color]
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? underlineColors[color]
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-gray-400">({tab.count})</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
