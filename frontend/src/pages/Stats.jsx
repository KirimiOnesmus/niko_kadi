import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import {
  BsEmojiSmile,
  BsEmojiNeutral,
  BsEmojiFrown,
  BsEmojiDizzy,
} from "react-icons/bs";
import * as statsApi from '../services/statsService';
import { submitQueueReport } from '../services/queueService';
import * as centersApi from '../services/centerServices';


const Stats = () => {
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
 

  const [stats, setStats] = useState({
    totalRegistrations: "22,102,532",
    todayRegistrations: "0",
    todayActiveUsers: "0",
    growthPercentage: "+0%",
    activeCenters: "0",
    countiesCovered: "0 / 47",
    totalReports: "0",
    todayReports: "0"
  });

  const [countyLeaderboard, setCountyLeaderboard] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setLiveTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, leaderboardData, trendsData] = await Promise.all([
        statsApi.getOverviewStats(),
        statsApi.getCountyLeaderboard(10, 30),
        statsApi.getWeeklyTrends()
      ]);
      if (overviewData.success) setStats(overviewData.data);
      if (leaderboardData.success) setCountyLeaderboard(leaderboardData.data);
      if (trendsData.success) setWeeklyData(trendsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSince = () => {
    const diff = Math.floor((new Date() - liveTime) / 60000);
    if (diff === 0) return "Just now";
    if (diff === 1) return "1 minute ago";
    return `${diff} minutes ago`;
  };

  const maxValue = weeklyData.length > 0
    ? Math.max(...weeklyData.map((d) => d.value))
    : 1;

  const handleQueueSubmit = async () => {
    if (!selectedQueue) return;
    setSubmitting(true);
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      );
      const { latitude: userLat, longitude: userLng } = position.coords;
      const nearestRes = await centersApi.findNearestCenters(userLat, userLng, 1);
      if (!nearestRes.success || !nearestRes.data?.length) throw new Error('No registrations found near you');
      const center = nearestRes.data[0];
      const result = await submitQueueReport({ centerId: center._id, status: selectedQueue, userLat, userLng });
      alert(`Report submitted for ${center.name}!\nEst. wait time: ~${result.data.waitTime} mins`);
      setShowQueueModal(false);
      setSelectedQueue(null);
      fetchDashboardData();
    } catch (error) {
      alert(` ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <FiTrendingUp className="text-green-400" size={16} />;
      case "down": return <FiTrendingUp className="text-red-400 rotate-180" size={16} />;
      default: return <span className="w-4 h-0.5 bg-zinc-600 rounded-full inline-block" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm sm:text-base">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-24 pb-10 sm:pb-16 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8 sm:mb-12">
            <div>
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-emerald-500 shrink-0" />
                Live Dashboard
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tighter mb-4 sm:mb-6">
                Siri ni <br />
                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                  Numbers
                </span>
                <span className="inline-block ml-2 sm:ml-4 text-3xl sm:text-5xl">📊</span>
              </h1>
              <p className="text-zinc-400 text-base sm:text-xl leading-relaxed max-w-2xl">
                Live registration statistics across Kenya. Tracking the pulse of
                democracy in real-time.
              </p>
            </div>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border-2 border-blue-500/30 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-5 sm:py-6">
              <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2 sm:mb-3">
                Total Registrations (IEBC 2022)
              </div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-blue-400 to-blue-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                {stats.totalRegistrations}
              </div>
              <div className="text-zinc-500 text-xs sm:text-sm font-medium">
                Official baseline data
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border-2 border-green-500/30 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-5 sm:py-6">
              <div className="text-green-400 text-xs font-black uppercase tracking-widest mb-2 sm:mb-3">
                Active Users Today
              </div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-green-400 to-green-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                {stats.todayRegistrations}
              </div>
              <div className="text-zinc-500 text-xs sm:text-sm font-medium">
                Users within center proximity
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border-2 border-purple-500/30 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-5 sm:py-6">
              <div className="text-purple-400 text-xs font-black uppercase tracking-widest mb-2 sm:mb-3">
                Queue Reports Today
              </div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-purple-400 to-purple-300 bg-clip-text text-transparent mb-2 sm:mb-3">
                {stats.todayReports}
              </div>
              <div className="text-zinc-500 text-xs sm:text-sm font-medium">
                Live queue status submissions
              </div>
            </div>
          </div>
        </div>
      </section>

  
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 sm:pb-20">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

        
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
              <div className="flex items-start sm:items-center justify-between mb-5 sm:mb-6 gap-3">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-white mb-1 sm:mb-2">
                    Top Counties by Queue Reports
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium">
                    Most active queue reporting in the last 30 days
                  </p>
                </div>
                <button className="flex items-center gap-1 text-green-400 font-bold text-sm hover:text-green-300 transition-colors flex-shrink-0">
                  View All
                  <FiChevronRight size={16} />
                </button>
              </div>

          
              <div className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 pb-3 border-b border-zinc-800 mb-2">
                <div className="col-span-1 text-zinc-600 text-xs font-black uppercase tracking-widest">#</div>
                <div className="col-span-5 text-zinc-600 text-xs font-black uppercase tracking-widest">County</div>
                <div className="col-span-3 text-zinc-600 text-xs font-black uppercase tracking-widest">Reports</div>
                <div className="col-span-2 text-zinc-600 text-xs font-black uppercase tracking-widest hidden sm:block">Centers</div>
                <div className="col-span-1 text-zinc-600 text-xs font-black uppercase tracking-widest text-right">↑↓</div>
              </div>

              {/* Rows */}
              <div className="space-y-1">
                {countyLeaderboard.length > 0 ? (
                  countyLeaderboard.map((county) => (
                    <div
                      key={county.rank}
                      className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 hover:bg-zinc-900/50 rounded-xl transition-colors group cursor-pointer"
                    >
                      <div className="col-span-1 flex items-center">
                        <span className="text-zinc-600 font-black text-sm sm:text-lg group-hover:text-green-400 transition-colors">
                          {county.rank < 10 ? `0${county.rank}` : county.rank}
                        </span>
                      </div>
                      <div className="col-span-5 flex items-center">
                        <h3 className="text-white font-black text-sm sm:text-base group-hover:text-green-400 transition-colors truncate">
                          {county.name}
                        </h3>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-zinc-400 font-bold text-sm sm:text-base">
                          {county.submissions}
                        </span>
                      </div>
                      <div className="col-span-2 items-center hidden sm:flex">
                        <span className="text-zinc-500 font-medium text-sm">
                          {county.uniqueCenters}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        {getTrendIcon(county.trend)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 sm:py-12 text-zinc-600 text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
           
            <button
              onClick={() => setShowQueueModal(true)}
              className="w-full bg-gradient-to-br from-green-500/10 to-transparent border-2 cursor-pointer border-green-500/30 hover:border-green-500/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BsEmojiSmile className="text-green-400" size={24} />
                </div>
                <FiChevronRight className="text-green-400" size={22} />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mb-1 sm:mb-2 group-hover:text-green-400 transition-colors">
                Report Queue Status
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Help others by sharing how long the wait is at your registration center.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-center">
                  <div className="text-green-400 font-black text-base sm:text-lg">
                    {stats.totalReports}
                  </div>
                  <div className="text-zinc-600 text-xs font-bold uppercase">Total</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-center">
                  <div className="text-purple-400 font-black text-base sm:text-lg">
                    {stats.todayReports}
                  </div>
                  <div className="text-zinc-600 text-xs font-bold uppercase">Today</div>
                </div>
              </div>
            </button>

            
            <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-black text-white mb-4 sm:mb-6">
                Weekly Activity
              </h3>

              <div className="flex items-end justify-between gap-1 sm:gap-2 h-36 sm:h-48 mb-4 sm:mb-6">
                {weeklyData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                    <div className="w-full flex items-end justify-center flex-1">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-400 hover:to-green-300"
                        style={{ height: `${(data.value / maxValue) * 100}%` }}
                      />
                    </div>
                    <div className="text-zinc-600 text-[10px] sm:text-xs font-black uppercase">
                      {data.day}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-1">
                  Activity Summary
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  {stats.countiesCovered} counties covered with {stats.activeCenters} active centers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <button
        onClick={() => setShowQueueModal(true)}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-30 group cursor-pointer"
      >
        <div className="relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 transition-all">
            <BsEmojiSmile className="text-black" size={24} />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full border-2 border-zinc-950 flex items-center justify-center">
            <span className="text-white text-xs font-black">!</span>
          </div>
          <div className="absolute right-full mr-3 sm:mr-4 top-1/2 -translate-y-1/2 bg-zinc-900 border-2 border-zinc-800 rounded-xl px-3 sm:px-4 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
            <span className="text-white font-bold text-sm">Report Queue Status</span>
          </div>
        </div>
      </button>

    
      <div className="fixed bottom-8 left-8 z-20 hidden lg:block">
        <div className="bg-zinc-900/90 backdrop-blur-sm border-2 border-zinc-800 rounded-2xl p-5 w-64">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <FiUsers className="text-green-400" size={20} />
            </div>
            <div>
              <div className="text-zinc-600 text-xs font-black uppercase tracking-widest">Live Reports</div>
              <div className="text-green-400 font-black text-lg">{stats.totalReports}</div>
            </div>
          </div>
          <div className="text-zinc-600 text-xs font-bold text-center pt-3 border-t border-zinc-800">
            Updated {getTimeSince()}
          </div>
        </div>
      </div>

      
      {showQueueModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full overflow-hidden">
            <div className="p-6 sm:p-8 pb-4 sm:pb-6 relative">
              <button
                onClick={() => setShowQueueModal(false)}
                className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <FiX className="text-zinc-400" size={18} />
              </button>

              
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">
                Queue Report
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base font-medium">
                How long is the line at your current center?
              </p>
            </div>

            <div className="px-5 sm:px-8 pb-6 sm:pb-8">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                {[
                  { key: "short", label: "Short", sub: "<15M", icon: <BsEmojiSmile className="text-green-400" size={40} />, active: "bg-green-500/10 border-green-500" },
                  { key: "moderate", label: "Moderate", sub: "15-45M", icon: <BsEmojiNeutral className="text-yellow-400" size={40} />, active: "bg-yellow-500/10 border-yellow-500" },
                  { key: "long", label: "Long", sub: "45-90M", icon: <BsEmojiFrown className="text-orange-400" size={40} />, active: "bg-orange-500/10 border-orange-500" },
                  { key: "verylong", label: "Very Long", sub: ">90M", icon: <BsEmojiDizzy className="text-red-400" size={40} />, active: "bg-red-500/10 border-red-500" },
                ].map(({ key, label, sub, icon, active }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedQueue(key)}
                    className={`flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedQueue === key
                        ? active
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {icon}
                    <div className="text-white font-black text-base sm:text-lg">{label}</div>
                    <div className="text-zinc-500 text-xs sm:text-sm font-medium">{sub}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleQueueSubmit}
                disabled={!selectedQueue || submitting}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black text-base sm:text-lg py-4 sm:py-5 rounded-2xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;