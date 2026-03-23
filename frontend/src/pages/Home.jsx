import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiUsers, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import { BsTwitterX, BsTiktok, BsInstagram } from 'react-icons/bs'
import { WeeklyTopics } from '../compenents'

const stats = [
  { number: '28.5M', label: 'Target voters by 2027' },
  { number: '6.3M', label: 'New registrations needed' },
  { number: '70%', label: 'Expected to be youth' },
  { number: '30', label: 'Days of the drive' },
]

const reasons = [
  {
    icon: <FiUsers size={24} className="text-emerald-400" />,
    title: 'Your vote, your future',
    body: 'The 2027 election will be decided by the people who show up — not the ones who stayed home. Gen Z is the largest voting bloc in Kenya. That power only works if you register.',
    color: 'emerald'
  },
  {
    icon: <FiMapPin size={24} className="text-rose-400" />,
    title: 'It takes 10 minutes',
    body: 'Walk into any IEBC constituency office with your National ID. Fingerprints, photo, done. You get an acknowledgement slip and you are on the register within 30 days.',
    color: 'rose'
  },
  {
    icon: <FiCheckCircle size={24} className="text-blue-400" />,
    title: 'Honour the ones who showed up',
    body: 'The 2024 finance bill protests proved Kenyan youth can move mountains. #NikoKadi is the next chapter — turning that energy from the streets into the ballot box.',
    color: 'blue'
  },
]

// const timeline = [
//   { date: 'March 17–19', event: 'Activists camp at Kasarani IEBC, register 641 voters in one day' },
//   { date: 'March 19', event: '1,000+ Chuka University students walk out after being told to wait — it goes viral' },
//   { date: 'Week of March 17', event: 'Nyeri reports 500+ youth registrations. Long queues form across Nairobi' },
//   { date: 'March 30', event: 'Official IEBC mass drive kicks off — 30 days, targeting 2.5M new voters' },
//   { date: '2027', event: 'General Election. The youth register decides who leads Kenya next' },
// ]

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">

   
      <section className="relative px-4 sm:px-6 pt-12 pb-24 sm:pb-40 max-w-6xl mx-auto">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
        
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-emerald-500/10 backdrop-blur-sm border-2 border-emerald-500/30 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 mb-8 sm:mb-12">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50 shrink-0" />
            <span className="text-emerald-400 text-xs sm:text-sm font-bold tracking-wide uppercase">
              Drive starts March 30, 2026
            </span>
          </div>

       
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter mb-4 sm:mb-8">
            Niko Kadi.
          </h1>
          <h2 className="text-3xl sm:text-5xl font-black leading-none tracking-tighter mb-6 sm:mb-10">
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Je, wewe?
            </span>
          </h2>

          <p className="text-zinc-300 text-base sm:text-xl leading-relaxed max-w-3xl mb-10 sm:mb-14 font-medium">
            I have my voter's card — do you? That one question sparked the biggest civic
            awakening Kenya has seen in years. This is your chance to be part of it.
          </p>

          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-5 mb-10 sm:mb-16">
            <Link
              to="/pin-location"
              className="group relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4
              rounded-2xl transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 text-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Find a center near me
                <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              to="/chukua-card"
              className="group bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl border-2 border-zinc-700
               hover:border-emerald-500/50 transition-all duration-300 text-center"
            >
              How to register
            </Link>
          </div>

          
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Share the movement</span>
            <div className="flex gap-3">
              
              <a  href="https://twitter.com/intent/tweet?text=Niko+Kadi+%F0%9F%87%B0%F0%9F%87%AA+%23NikoKadi+%23RegisterToVote"
                target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
              >
                <BsTwitterX size={16} />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
              >
                <BsTiktok size={16} />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
              >
                <BsInstagram size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      
      <section className="relative border-y-2 border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-zinc-900/50 to-emerald-950/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl sm:text-6xl font-black bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                {s.number}
              </p>
              <p className="text-zinc-500 text-[11px] sm:text-sm font-bold uppercase tracking-wider leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

    
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-32">
        <div className="grid lg:grid-cols-5 gap-8 sm:gap-16 items-start">
          <div className="lg:col-span-2">
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-emerald-500 shrink-0" />
              What is #NikoKadi
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 sm:mb-6 leading-tight">
              It started as a card game phrase.
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Now it's a movement.
              </span>
            </h3>
          </div>

          <div className="lg:col-span-3 space-y-4 sm:space-y-6 text-base sm:text-lg text-zinc-400 leading-relaxed">
            <p className="text-zinc-300 font-medium">
              "Niko Kadi" — literally "I have the card" — comes from a popular Kenyan card game.
              Somewhere between March 17 and 19, 2026, activists in Nairobi flipped that phrase
              into something much bigger: proof that you're registered to vote.
            </p>
            <p>
              Young people started posting photos of their voter cards on TikTok and Instagram
              with the caption "Niko Kadi" — then tagging friends. Peer pressure, but make it
              civic. Within days it had become the loudest thing on Kenyan social media.
            </p>
            <p>
              For many Gen Z Kenyans, this is a direct response to the 2024 finance bill
              protests. People died demanding change. #NikoKadi is the follow-through —
              turning that anger into something the government actually has to reckon with:
              millions of new voters showing up in 2027.
            </p>
            <p className="text-green-400 font-bold text-base sm:text-lg">Credit: #Allan Andeba</p>
          </div>
        </div>
      </section>


      <section className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-y-2 border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.05),transparent_50%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-32">
          <div className="mb-10 sm:mb-16">
            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-zinc-700 shrink-0" />
              Why it matters
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Three reasons you should register today
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="group relative bg-zinc-900/50 backdrop-blur-sm border-2 border-zinc-800
                hover:border-emerald-500/30 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:cursor-pointer"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-${r.color}-500/10 border-2 border-${r.color}-500/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  {r.icon}
                </div>
                <h3 className="text-white font-black text-lg sm:text-xl mb-3 sm:mb-4">{r.title}</h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section>
        <WeeklyTopics />
      </section>

    
      <section className="relative border-t-2 border-emerald-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 leading-none">
            Uko kadi?
          </h2>
          <p className="text-zinc-400 text-base sm:text-xl mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed">
            The clock is ticking. The official drive runs March 30 to April 30.
            Find your nearest IEBC office and get it done.
          </p>

          <Link
            to="/pin-location"
            className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl
            transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
          >
            Find an IEBC center
            <FiArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-zinc-600 text-xs sm:text-sm font-bold mt-6 sm:mt-8 uppercase tracking-widest">
            Bring your National ID · It's free · It takes 10 minutes
          </p>
        </div>
      </section>

    </div>
  )
}

export default Home