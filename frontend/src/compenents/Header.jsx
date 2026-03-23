import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getLiveCount } from "../services/statsService";
import logo2 from "../assets/logo.png";

const Header = () => {
  const [liveCount, setLiveCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchLiveCount = async () => {
    try {
      const res = await getLiveCount();
      if (res.success) {
        setLiveCount(res.data.count);
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
    } catch (err) {
      console.error("Failed to fetch live count:", err);
    }
  };

  useEffect(() => {
    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: "/pin-location", label: "Find Center" },
    { to: "/chukua-card", label: "How to Register" },
    { to: "/ji-verify", label: "Check Status" },
    { to: "/siri-ni-numbers", label: "Statistics" },
  ];

  return (
    <>
   
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-gradient-to-r from-black via-green-700 via-white to-red-700 to-black" />

    
      <header className="fixed top-[3px] left-0 right-0 z-50 h-[70px] flex items-center justify-between px-4 md:px-6 bg-neutral-850/95 backdrop-blur border-b border-white/10">

   
        <NavLink
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={logo2}
            alt="Niko Kadi Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="text-[13px] md:text-[15px] uppercase tracking-widest font-bold">
            <span className="text-red-600">Siri</span>{" "}
            <span className="text-white">ni</span>{" "}
            <span className="text-green-600">Numbers</span>
          </p>
        </NavLink>


        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 outline-none whitespace-nowrap
                ${isActive
                  ? "bg-green-900/40 border border-green-600/50 text-green-400"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="w-px h-5 bg-white/10 mx-2" />

    
          <LiveCount liveCount={liveCount} pulse={pulse} />
        </div>

{/* // Mobile menu button         */}
        <div className="flex md:hidden items-center gap-3">
          <LiveCount liveCount={liveCount} pulse={pulse} />

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

  
      {menuOpen && (
        <div className="fixed top-[73px] left-50 right-0 z-40 h-screen  bg-neutral-900/90 border-b border-white/10 flex flex-col px-4 py-3 gap-1 md:hidden">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-150
                ${isActive
                  ? "bg-green-900/40 border border-green-600/50 text-green-400"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="h-[73px] bg-black" />
    </>
  );
};


const LiveCount = ({ liveCount, pulse }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 shrink-0">
    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
    <span className={`text-sm font-bold text-white transition-transform duration-300 ${pulse ? "scale-110" : "scale-100"}`}>
      {liveCount.toLocaleString()}
    </span>
    <span className="text-[10px] font-semibold text-green-400 tracking-wider uppercase">
      reports
    </span>
  </div>
);

export default Header;