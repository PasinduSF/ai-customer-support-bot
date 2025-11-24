"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Loader2,
  MessageSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { GET_ANALYTICS } from "@/constants/response-message";

interface LogEntry {
  intent: string;
  term: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: GET_ANALYTICS }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.analytics) {
        setLogs(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalQueries = logs.length;

  const intentCounts = logs.reduce((acc, log) => {
    acc[log.intent] = (acc[log.intent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedIntents = Object.entries(intentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const termCounts = logs
    .filter((l) => l.intent === "recommend_product" && l.term !== "N/A")
    .reduce((acc, log) => {
      acc[log.term] = (acc[log.term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedTerms = Object.entries(termCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">
          Loading Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Nova Analytics Dashboard
            </h1>
            <p className="text-slate-500">
              Real-time insights from chatbot interactions
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <MessageSquare size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Total Interactions
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900">{totalQueries}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <BarChart3 size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Top Intent
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 capitalize">
              {sortedIntents[0]?.[0]?.replace("_", " ") || "No Data"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {sortedIntents[0]?.[1] || 0} hits
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Trending Search
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 capitalize">
              {sortedTerms[0]?.[0] || "No Data"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-slate-400" />
              Intent Analysis
            </h3>
            <div className="space-y-4">
              {sortedIntents.length === 0 ? (
                <p className="text-slate-400 text-sm">No data available yet.</p>
              ) : (
                sortedIntents.map(([intent, count]) => (
                  <div
                    key={intent}
                    className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="font-medium capitalize text-slate-700">
                        {intent.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(count / totalQueries) * 100}%`,
                          }}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Search size={20} className="text-slate-400" />
              Top Search Terms
            </h3>
            <div className="space-y-3">
              {sortedTerms.length === 0 ? (
                <p className="text-slate-400 text-sm">No searches yet.</p>
              ) : (
                sortedTerms.map(([term, count], index) => (
                  <div
                    key={term}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full text-xs font-bold text-slate-400 border border-slate-200">
                        {index + 1}
                      </span>
                      <span className="font-medium capitalize text-slate-700">
                        {term}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                      {count} searches
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
