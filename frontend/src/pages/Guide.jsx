import React, { useState } from "react";
import {
  FiCheckCircle,
  FiX,
  FiChevronRight,
  FiAlertCircle,
  FiFileText,
  FiMapPin,
  FiCreditCard,
  FiAward,
  FiShield,
} from "react-icons/fi";
import { FaRegLightbulb } from "react-icons/fa";
import { BsWhatsapp, BsFingerprint } from "react-icons/bs";

const registrationSteps = [
  {
    id: 1,
    title: "Eligibility Check",
    icon: <FiCheckCircle size={24} />,
    description:
      "Before proceeding to an IEBC registration center, ensure you meet the legal constitutional requirements for a Kenyan voter.",
    requirements: [
      "Be a Kenyan Citizen (By birth or registration)",
      "Have attained the age of 18 years and above",
      "Possess a valid National Identity Card or Passport",
      "Be of sound mind and not disqualified by any law",
    ],
    color: "emerald",
  },
  {
    id: 2,
    title: "Gather Documents",
    icon: <FiFileText size={24} />,
    description:
      "Prepare your original identification documents. Photocopies will not be accepted.",
    requirements: [
      "Original National ID Card (not a copy)",
      "Valid Kenyan Passport (alternative to ID)",
      "If ID recently replaced, bring the original physical card",
      "No additional forms needed - available at center",
    ],
    color: "blue",
  },
  {
    id: 3,
    title: "Visit IEBC Office",
    icon: <FiMapPin size={24} />,
    description:
      "Locate and visit your nearest IEBC constituency office during working hours.",
    requirements: [
      "Find center using our Map tool",
      "Visit during working hours (8AM - 5PM)",
      "Choose any registration center nationwide",
      "Check live queue times before visiting",
    ],
    color: "purple",
  },
  {
    id: 4,
    title: "Fill Application",
    icon: <FiCreditCard size={24} />,
    description:
      "Complete Form A (Application for Registration) provided at the center.",
    requirements: [
      "Registration officer provides Form A",
      "Fill in personal details accurately",
      "Declare your preferred polling station",
      "Process takes approximately 5-10 minutes",
    ],
    color: "yellow",
  },
  {
    id: 5,
    title: "Biometric Capture",
    icon: <BsFingerprint size={24} />,
    description:
      "Digital capture of your fingerprints and photograph for voter identification.",
    requirements: [
      "Fingerprints captured digitally",
      "Photograph taken on site",
      "Biometric data stored securely",
      "Ensures one person, one vote",
    ],
    color: "rose",
  },
  {
    id: 6,
    title: "Get Acknowledgement",
    icon: <FiAward size={24} />,
    description:
      "Collect your registration acknowledgement slip with voter details.",
    requirements: [
      "Receive acknowledgement slip immediately",
      "Slip contains your voter details",
      "Keep slip safe for your records",
      "Note: Slip not required for voting",
    ],
    color: "teal",
  },
];

const upcomingMilestones = [
  {
    icon: <FiFileText size={20} />,
    title: "Documents",
    description: "Prepare ID and supporting forms",
    color: "blue",
  },
  {
    icon: <FiMapPin size={20} />,
    title: "Visit Office",
    description: "Locate nearest IEBC station",
    color: "rose",
  },
  {
    icon: <BsFingerprint size={20} />,
    title: "Biometric",
    description: "Digital capture of fingerprints",
    color: "purple",
  },
  {
    icon: <FiAward size={20} />,
    title: "Acknowledgement",
    description: "Collect your registration slip",
    color: "yellow",
  },
  {
    icon: <FiShield size={20} />,
    title: "Verify Online",
    description: "Confirm details via IEBC Portal",
    color: "teal",
  },
];

const faqs = [
  {
    question: "How do you register as a voter?",
    answer:
      "An eligible voter must present himself or herself to the registration officer with his/her original identification documents at the designated registration centre during working hours. The applicant fills the Application for Registration form (Form A). Registered voters will be issued with a registration acknowledgement slip bearing the voter's details. However, this slip will not be a requirement for voting.",
  },
  {
    question: "When can someone be denied registration?",
    answer:
      "You can be denied when: (1) You are under 18 years of age, (2) You are not in possession of the original ID card or a valid Kenyan passport, (3) You are an un-discharged bankrupt, (4) You have been found guilty by an election court or reported to be guilty of any election offence during the preceding five years, (5) If a competent court declares you to be of unsound mind.",
  },
  {
    question: "Is an eligible voter allowed to register more than once?",
    answer:
      "No! A person is only allowed to register once as a voter in a constituency or registration centre of his or her choice. It is an offence to register more than once.",
  },
  {
    question: "What is the penalty of registering more than once?",
    answer:
      "Persons who have registered more than once are liable on conviction, to a fine not exceeding one hundred thousand Kenya shillings or imprisonment for a term not exceeding one year or both. Such persons shall be barred from participating in the immediate election and the next that follows.",
  },
  {
    question:
      "Can a person transfer as a voter to another registration centre?",
    answer:
      "YES! A person may transfer as a voter to another registration centre of his or her choice within the registration period.",
  },
];

const benefits = [
  {
    icon: <FiCheckCircle size={24} />,
    title: "Vote & Elect Leaders",
    description:
      "It gives you an opportunity to vote and elect leaders of your choice.",
    color: "emerald",
  },
  {
    icon: <FiAward size={24} />,
    title: "Vie for Office",
    description: "It allows you to vie for any elective position",
    color: "blue",
  },
  {
    icon: <FiFileText size={24} />,
    title: "Nominate Candidates",
    description: "It gives you the right to nominate candidates for elections",
    color: "purple",
  },
  {
    icon: <FiShield size={24} />,
    title: "Hold Leaders Accountable",
    description: "It gives you moral authority to hold leaders accountable",
    color: "rose",
  },
];

const Guide = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-34 pb-34 max-w-6xl mx-auto">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-emerald-500" />
            Registration Guide
          </p>

          <h1 className="text-6xl sm:text-7xl font-black text-white leading-none tracking-tighter mb-6">
            Chukua Card.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Uwe Kadi.
            </span>
          </h1>

          <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mb-10">
            Your voter's card is your power move. Six quick steps, 10-15 minutes max, and you're ready to make your voice heard in 2027.
          </p>
        </div>
      </section>

      {/* Active Step Details */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {registrationSteps
              .filter((step) => step.id === activeStep)
              .map((step) => (
                <div
                  key={step.id}
                  className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-zinc-800 rounded-3xl p-10"
                >
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-6">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-${step.color}-500/10 border-2 border-${step.color}-500/30 flex items-center justify-center text-${step.color}-400`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-1">
                        Step {step.id} of 6
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2">
                        {step.title}
                      </h2>
                      <p className="text-zinc-400 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    {step.requirements.map((req, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-${step.color}-500/20 border-2 border-${step.color}-500/40 flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <FiCheckCircle
                            className={`text-${step.color}-400`}
                            size={14}
                          />
                        </div>
                        <p className="text-zinc-300 font-medium leading-relaxed">
                          {req}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
                    <button
                      onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                      disabled={activeStep === 1}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white 
                      hover:border-2 hover:border-green-400 font-bold px-6 py-3 rounded-xl
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <FiChevronRight size={20} className="rotate-180" />
                      Previous Step
                    </button>

                    <div className="text-zinc-600 font-black text-sm">
                      Step {activeStep} of 6
                    </div>

                    <button
                      onClick={() => setActiveStep(Math.min(6, activeStep + 1))}
                      disabled={activeStep === 6}
                      className={`flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all cursor-pointer ${
                        activeStep === 6
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                      }`}
                    >
                      {activeStep === 6
                        ? "Journey Complete"
                        : "Continue to Documents"}
                      {activeStep !== 6 && <FiChevronRight size={20} />}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Sidebar - Milestones */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl p-6 sticky top-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-6">
                Upcoming Milestones
              </h3>
              <div className="space-y-2">
                {upcomingMilestones.map((milestone, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-xl transition-all ${
                      i + 2 === activeStep
                        ? "bg-emerald-500/10 border-2 border-emerald-500/30"
                        : "bg-zinc-900/50 border border-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-${milestone.color}-500/10 border border-${milestone.color}-500/30 flex items-center justify-center text-${milestone.color}-400 flex-shrink-0`}
                    >
                      {milestone.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm mb-1">
                        {milestone.title}
                      </h4>
                      <p className="text-zinc-500 text-xs font-medium">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Tip */}
              <div className="mt-4 bg-zinc-900 border-2 border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <FaRegLightbulb className="text-emerald-400" size={20} />
                  <h4 className="text-white font-black text-sm">Quick Tip</h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  If you have recently replaced your ID, ensure you have the
                  original physical card. Waiting slips are generally not
                  accepted for biometric registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Register Section */}
      <section className="border-y-2 border-zinc-800 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-6 py-18">
          <div className="mb-8">
            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-zinc-700" />
              Why Register
            </p>
            <h2 className="text-4xl font-black text-white">
              Kadi Yako = Nguvu Yako
            </h2>
            <p className="text-zinc-400 text-lg mt-3">
              Your card is your power. Here's why it matters.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border-2 border-zinc-800 hover:border-emerald-500/30 cursor-pointer
                 rounded-2xl p-6 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-${benefit.color}-500/10 border-2 border-${benefit.color}-500/30 
                  flex items-center justify-center text-${benefit.color}-400 mb-6 group-hover:scale-110 
                  transition-transform`}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-white font-black text-xl mb-2">
                  {benefit.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-zinc-700" />
            Common Questions
          </p>
          <h2 className="text-4xl font-black text-white mb-4">
            Maswali? We Got You.
          </h2>
          <p className="text-zinc-400 text-lg">
            Everything you need to know about getting your voter's card.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left
                 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <h3 className="text-white font-black text-md pr-4">
                  {faq.question}
                </h3>
                <FiChevronRight
                  size={24}
                  className={`text-emerald-400 transition-transform flex-shrink-0 ${
                    expandedFaq === i ? "rotate-90" : ""
                  }`}
                />
              </button>
              {expandedFaq === i && (
                <div className="px-6 pb-6 border-t border-zinc-800">
                  <p className="text-zinc-400 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t-2 border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Tayari Kuchukua Card?
          </h2>
          <p className="text-zinc-400 text-xl mb-10 max-w-2xl mx-auto">
            Find your nearest IEBC office and get registered in less than 15 minutes. No cap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => (window.location.href = "/pin-location")}
              className="group bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg px-8 py-4 
            rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 
            flex items-center gap-3 cursor-pointer"
            >
              Find Nearest Center
              <FiMapPin size={20} />
            </button>
            <button
              className="group bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg px-8 py-4 
            rounded-2xl border-2 border-zinc-700 hover:border-emerald-500/50 
            transition-all flex items-center gap-3 cursor-pointer"
            >
              <BsWhatsapp size={20} />
              Get Help on WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Guide;