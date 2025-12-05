"use client";

import { useState } from "react";
import { SessionsList } from "@/components/SessionsList";
import { StringsList } from "@/components/StringsList";

type Tab = "sessions" | "strings";

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
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("sessions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "sessions"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📅 Sessions
            </button>
            <button
              onClick={() => setActiveTab("strings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "strings"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🧵 My Strings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "sessions" ? <SessionsList /> : <StringsList />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            Tennis Journal © {new Date().getFullYear()} - Track your progress,
            improve your game
          </p>
        </div>
      </footer>
    </div>
  );
}
