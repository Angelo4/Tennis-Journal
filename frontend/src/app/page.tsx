"use client";

import { useState } from "react";
import { SessionsList } from "@/components/sessions";
import { StringsList, StringOverview } from "@/components/strings";
import { Tabs } from "@/components/ui";

type Tab = "sessions" | "strings" | "overview";

const tabs = [
  { id: "sessions", label: "Sessions", icon: "📅" },
  { id: "strings", label: "My Strings", icon: "🧵" },
  { id: "overview", label: "String Overview", icon: "📊" },
];

const tabColors: Record<Tab, "green" | "yellow" | "purple"> = {
  sessions: "green",
  strings: "yellow",
  overview: "purple",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("sessions");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎾</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tennis Journal
              </h1>
              <p className="text-sm text-gray-500">
                Track your sessions and string usage
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as Tab)}
          color={tabColors[activeTab]}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "sessions" && <SessionsList />}
        {activeTab === "strings" && <StringsList />}
        {activeTab === "overview" && <StringOverview />}
      </main>
    </div>
  );
}
