"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { SessionsList } from "@/components/sessions";
import { StringsList, StringOverview } from "@/components/strings";
import { Tabs } from "@/components/ui";
import { useAuth } from "@/hooks";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🎾</span>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
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
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                Sign out
              </button>
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
