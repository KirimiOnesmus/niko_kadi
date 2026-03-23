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
    if (!idNumber || idNumber.length < 6) {
      return
    }

    setIsVerifying(true)
    
    // Simulate API call
    setTimeout(() => {
      // Mock result - replace with actual API call
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
    // Could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 max-w-5xl mx-auto text-center overflow-hidden">
        
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter mb-6">
            Verify Your <br />
            <span className="bg-green-600 bg-clip-text text-transparent">
              Voice.
            </span>
          </h1>
          
          <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Confirm your voter registration status in seconds using your National ID or Passport number.
          </p>


          {/* <div className="max-w-2xl mx-auto">
            <div className="relative mb-4">
              <label className="block text-left text-emerald-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">
                National ID Number
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="29485731"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                  className="flex-1 bg-zinc-900 border-2 border-zinc-800 focus:border-emerald-500/50 rounded-2xl
                   px-4 py-3 text-white text-xl font-bold placeholder-zinc-600 focus:outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                />
                <button
                  onClick={handleVerify}
                  disabled={!idNumber || idNumber.length < 6 || isVerifying}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black 
                  font-black text-md px-6 py-2 rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 
                  hover:shadow-emerald-500/50 disabled:shadow-none flex items-center gap-3 whitespace-nowrap cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      VERIFY
                      <FiSearch size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Verification Result - Success */}
      {/* {verificationResult && (
        <section className="max-w-4xl mx-auto px-6 pb-12 animate-slide-up">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border-2 border-emerald-500/30 rounded-3xl p-8 mb-8">
            
            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="text-emerald-400" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">
                  Registration Confirmed!
                </h2>
                <p className="text-emerald-400 font-bold">
                  You are registered and ready to vote in 2027
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                  Full Name
                </div>
                <div className="text-white font-black text-lg">
                  {verificationResult.name}
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                  ID Number
                </div>
                <div className="text-white font-black text-lg">
                  {verificationResult.idNumber}
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                  Constituency
                </div>
                <div className="text-white font-black text-lg">
                  {verificationResult.constituency}
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                  Ward
                </div>
                <div className="text-white font-black text-lg">
                  {verificationResult.ward}
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 sm:col-span-2">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                  Polling Station
                </div>
                <div className="text-white font-black text-lg">
                  {verificationResult.pollingStation}
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 sm:col-span-2">
                <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                  Registered Date
                </div>
                <div className="text-emerald-400 font-black text-lg">
                  {verificationResult.registeredDate}
                </div>
              </div>
            </div>

      
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                Reference ID: {verificationResult.idNumber}
              </div>
            </div>
          </div>
        </section>
      )} */}

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-emerald-500/30 rounded-3xl p-8 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FiMessageSquare className="text-emerald-400" size={28} />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3">
              SMS Verification
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Send your ID number to the  shortcode.
            </p>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-3 mb-4">
              <div className="text-zinc-600 text-xs font-black uppercase tracking-widest ">
                SMS ID TO
              </div>
              <div className="flex items-center justify-between">
                <div className="text-emerald-400 font-black text-3xl">
                  70000
                </div>
                <button
                  onClick={() => handleCopy('70000')}
                  className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center 
                  transition-colors"
                >
                  <FiCopy className="text-zinc-400" size={16} />
                </button>
              </div>
            </div>

            <div className="text-zinc-600 text-xs font-bold">
              REFERENCE ID: {idNumber || '29485731'}
            </div>
          </div>

        
          <div className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-blue-500/30 rounded-3xl p-8 
          transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center 
            justify-center mb-6 group-hover:scale-110 transition-transform">
              <FiGlobe className="text-blue-400" size={28} />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3">
              Online Portal
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Access the official IEBC verification website.
            </p>

            <a
              href="https://verify.iebc.or.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500/50 rounded-2xl p-6 mb-4 transition-all group/link"
            >
              <div>
                <div className="text-blue-400 font-black text-lg mb-1 group-hover/link:underline">
                  verify.iebc.or.ke
                </div>
              </div>
              <FiExternalLink className="text-zinc-600 group-hover/link:text-blue-400" size={20} />
            </a>

            <div className="text-zinc-600 text-xs font-bold">
              REFERENCE ID: {idNumber || '29485731'}
            </div>
          </div>

       
          <div className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-red-500/30 rounded-3xl p-8 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FiPhone className="text-red-400" size={28} />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3">
              IEBC Helpline
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Speak directly with an agent.
            </p>

            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-3 mb-4">
              <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                CALL NOW
              </div>
              <a
                href="tel:0202877000"
                className="flex items-center justify-between group/phone"
              >
                <div className="text-red-400 font-black text-2xl group-hover/phone:underline">
                  020 2877000
                </div>
                <FiPhone className="text-zinc-600 group-hover/phone:text-red-400" size={20} />
              </a>
            </div>

            <div className="text-zinc-600 text-xs font-bold">
              REFERENCE ID: {idNumber || '29485731'}
            </div>
          </div>
        </div>
      </section>

   
      {/* {showNotRegistered && (
        <section className="max-w-4xl mx-auto px-6 pb-12 animate-slide-up">
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border-2 border-red-500/30 rounded-3xl
           px-8 py-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center
               justify-center flex-shrink-0">
                <FiAlertTriangle className="text-red-400" size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white mb-2">
                  Not registered yet or details missing?
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Don't wait until the last minute. Voter registration is an ongoing civic duty.
                </p>
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 bg-red-400 text-white font-black 
                  text-base px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                >
                  Find a Center
                  <FiSearch size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )} */}


      <section className="border-t-2 border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-black text-white mb-4">
            Need Help Verifying?
          </h2>
          <p className="text-zinc-400 text-md mb-8">
            Our support team is available 24/7 to assist you with voter verification.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/254"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3"
            >
              <BsWhatsapp size={20} />
              Chat on WhatsApp
            </a>
            <a
              href="tel:0202877000"
              className="group bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base px-8 py-4 rounded-xl border-2 border-zinc-700 hover:border-emerald-500/50 transition-all flex items-center gap-3"
            >
              <FiPhone size={20} />
              Call Helpline
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CheckStatus