import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";
import { getWeeklyTopics } from "../services/topicsService";

const WeeklyTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await getWeeklyTopics();

      if (response.success) {
        setTopics(response.data);
        setLastUpdate(response.lastUpdate);
        setNextUpdate(response.nextUpdate);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: {
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        dot: "bg-emerald-500",
      },
      blue: {
        border: "border-blue-500/30",
        text: "text-blue-400",
        dot: "bg-blue-500",
      },
      purple: {
        border: "border-purple-500/30",
        text: "text-purple-400",
        dot: "bg-purple-500",
      },
      yellow: {
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        dot: "bg-yellow-500",
      },
      teal: {
        border: "border-teal-500/30",
        text: "text-teal-400",
        dot: "bg-teal-500",
      },
    };
    return colors[color] || colors.emerald;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <FiTrendingUp className="text-emerald-400" size={16} />;
      case "down":
        return <FiTrendingDown className="text-rose-400" size={16} />;
      default:
        return <FiMinus className="text-zinc-500" size={16} />;
    }
  };

  if (loading && topics.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">Loading civic updates...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-32">
      <div className="mb-16">
        <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
          <span className="w-8 h-0.5 bg-zinc-700" />
          This Week in Civic Kenya
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              Top 5 Topics Trending Now
            </h2>
            <p className="text-zinc-500 font-medium">
              Live updates from IEBC & Kenyan media • Updated every 6 hours
            </p>
          </div>
          {lastUpdate && (
            <div className="text-right">
              <p className="text-xs text-zinc-600 font-bold">Last updated</p>
              <p className="text-xs text-zinc-500">
                {new Date(lastUpdate).toLocaleString("en-KE", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-transparent rounded-full" />

        <div className="space-y-10 pl-16">
          {topics.map((topic, i) => {
            const colorClasses = getColorClasses(topic.color);

            return (
              <div key={i} className="relative group">
                <div
                  className={`absolute -left-[56px] top-2 w-[18px] h-[18px] rounded-full border-4 ${colorClasses.dot} bg-zinc-950 shadow-lg shadow-${topic.color}-500/30 group-hover:scale-125 transition-transform`}
                  style={{
                    borderColor: colorClasses.dot.replace("bg-", "#"),
                  }}
                />

                <div
                  className={`${colorClasses.bg} border-2 ${colorClasses.border} rounded-2xl px-6 py-3 group-hover:border-opacity-50 transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`${colorClasses.text} text-xs font-black uppercase tracking-widest`}
                        >
                          #{topic.rank} • {topic.count} mention
                          {topic.count !== 1 ? "s" : ""}
                        </span>
                        {getTrendIcon(topic.trend)}
                      </div>
                      <h3 className="text-white font-black text-xl">
                        {topic.topic}
                      </h3>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-base leading-relaxed font-medium mb-2">
                    {topic.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-600 text-xs font-bold">
                        Sources:
                      </span>
                      {topic.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className="text-zinc-500 text-xs font-medium bg-zinc-800/50 px-2 py-1 rounded-lg"
                        >
                          {source}
                        </span>
                      ))}
                    </div>

                    {topic.lastMention && (
                      <span className="text-zinc-600 text-xs font-medium">
                        {new Date(topic.lastMention).toLocaleDateString(
                          "en-KE",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 flex justify-center items-center gap-4">
        <div className="bg-zinc-900/30  p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiExternalLink className="text-zinc-500" size={18} />
            </div>
            <div>
              <h4 className="text-white font-black text-sm mb-2">
                About These Updates
              </h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Topics are aggregated from official IEBC announcements and
                verified Kenyan media sources including Nation Media, Standard
                Digital, Citizen TV, and KTN News. All content links to original
                sources. This platform does not alter official information. For
                authoritative updates, always refer to{" "}
                <a
                  href="https://iebc.or.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                >
                  IEBC.or.ke
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeklyTopics;
