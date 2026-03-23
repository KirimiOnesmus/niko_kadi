import React, { useState } from 'react'
import { FiSearch, FiAlertTriangle, FiCheckCircle, FiX, FiExternalLink, FiPhone, FiMessageSquare, FiGlobe, FiCopy } from 'react-icons/fi'
import { BsWhatsapp } from 'react-icons/bs'
import { Link } from 'react-router-dom'

const CheckStatus = () => {
  const [idNumber, setIdNumber] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [showNotRegistered, setShowNotRegistered] = useState(false)

  const handleVerify = async () => {
    if (!idNumber || idNumber.length < 6) return

    setIsVerifying(true)

    setTimeout(() => {
      const isRegistered = Math.random() > 0.5

      if (isRegistered) {
        setVerificationResult({
          status: 'registered',
          name: 'JOHN KAMAU NJOROGE',
          idNumber: idNumber,
          constituency: 'STAREHE',
          ward: 'NGARA',
          pollingStation: 'CITY PRIMARY SCHOOL',
          registeredDate: 'March 15, 2026'
        })
        setShowNotRegistered(false)
      } else {
        setVerificationResult(null)
        setShowNotRegistered(true)
      }

      setIsVerifying(false)
    }, 1500)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

     
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-28 pb-12 sm:pb-20 max-w-5xl mx-auto text-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center justify-center gap-3">
            <span className="w-8 h-0.5 bg-emerald-500 shrink-0" />
            Voter Verification
            <span className="w-8 h-0.5 bg-emerald-500 shrink-0" />
          </p>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter mb-4 sm:mb-6">
            Verify Your <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Voice.
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-12">
            Confirm your voter registration status in seconds using your National ID or Passport number.
          </p>
        </div>
      </section>

     
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">

          
          <div className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-emerald-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <FiMessageSquare className="text-emerald-400" size={24} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">
              SMS Verification
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 sm:mb-6">
              Send your ID number to the shortcode.
            </p>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 mb-3 sm:mb-4">
              <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-1">
                SMS ID TO
              </div>
              <div className="flex items-center justify-between">
                <div className="text-emerald-400 font-black text-2xl sm:text-3xl">
                  70000
                </div>
                <button
                  onClick={() => handleCopy('70000')}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FiCopy className="text-zinc-400" size={15} />
                </button>
              </div>
            </div>

            <div className="text-zinc-600 text-xs font-bold">
              REFERENCE ID: {idNumber || '29485731'}
            </div>
          </div>

          
          <div className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-blue-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <FiGlobe className="text-blue-400" size={24} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">
              Online Portal
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 sm:mb-6">
              Access the official IEBC verification website.
            </p>

            <a
              href="https://verify.iebc.or.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-3 sm:mb-4 transition-all group/link"
            >
              <div className="text-blue-400 font-black text-base sm:text-lg group-hover/link:underline truncate pr-3">
                verify.iebc.or.ke
              </div>
              <FiExternalLink className="text-zinc-600 group-hover/link:text-blue-400 flex-shrink-0" size={18} />
            </a>

            <div className="text-zinc-600 text-xs font-bold">
              REFERENCE ID: {idNumber || '29485731'}
            </div>
          </div>

      
          <div className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-red-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all group sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <FiPhone className="text-red-400" size={24} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">
              IEBC Helpline
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 sm:mb-6">
              Speak directly with an agent.
            </p>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 mb-3 sm:mb-4">
              <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                CALL NOW
              </div>
              <a
                href="tel:0202877000"
                className="flex items-center justify-between group/phone"
              >
                <div className="text-red-400 font-black text-xl sm:text-2xl group-hover/phone:underline">
                  020 2877000
                </div>
                <FiPhone className="text-zinc-600 group-hover/phone:text-red-400" size={18} />
              </a>
            </div>

            <div className="text-zinc-600 text-xs font-bold">
              REFERENCE ID: {idNumber || '29485731'}
            </div>
          </div>
        </div>
      </section>

      
      <section className="border-t-2 border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">
            Need Help Verifying?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
            Our support team is available 24/7 to assist you with voter verification.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/254"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base px-6 sm:px-8 py-3.5 sm:py-4
              rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/50 hover:scale-105
              flex items-center justify-center gap-3"
            >
              <BsWhatsapp size={20} />
              Chat on WhatsApp
            </a>
            <a
              href="tel:0202877000"
              className="group bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base px-6 sm:px-8 py-3.5 sm:py-4
              rounded-2xl border-2 border-zinc-700 hover:border-emerald-500/50 transition-all
              flex items-center justify-center gap-3"
            >
              <FiPhone size={20} />
              Call Helpline
            </a>
          </div>

          <p className="text-zinc-600 text-xs font-bold mt-6 uppercase tracking-widest">
            Free to call · Available Mon–Fri 8AM–5PM
          </p>
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CheckStatus