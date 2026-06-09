"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface FormData {
  doctor_name: string;
  email_address: string;
  registration_number: string;
  phone_number: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

const sessions = [
  {
    id: 1,
    title: "The Anatomy of a Lawsuit – Understanding Dental Negligence",
    date: "Saturday, 13 June 2026",
    time: "1:00 PM – 2:00 PM",
    topics: ["Duty of Care & Bolam/Bolitho tests", "Common litigation triggers", "Mishap vs negligence"],
  },
  {
    id: 2,
    title: "The Paper Shield – Consent and Documentation",
    date: "Saturday, 20 June 2026",
    time: "1:00 PM – 2:00 PM",
    topics: ["Verbal vs written consent", "Minor & emergency procedures", "Medico-legal record keeping"],
  },
  {
    id: 3,
    title: "Consumer Protection Act (CPA) & The Dentist",
    date: "Saturday, 27 June 2026",
    time: "1:00 PM – 2:00 PM",
    topics: ["Consumer Redressal Commission", "Professional indemnity insurance", "Legal notice response"],
  },
  {
    id: 4,
    title: "Defensive Dentistry in the Digital Age",
    date: "Saturday, 4 July 2026",
    time: "1:00 PM – 2:00 PM",
    topics: ["Manual to digital records", "Post-operative instructions", "Litigation-proof workflow"],
  },
];

const speakers = [
  {
    name: "Dr. Kedarnath N.S.",
    credentials: "MDS, FIBOMS, FIBCSOMS, MFDS-RCPS (GLSG), PGDMLE (NLSIU)",
    position: "Professor & HOD, Department of Dentistry, KoIMS",
  },
  {
    name: "Dr. Usha Murali",
    credentials: "Consultant in Dental Surgery",
    position: "CGHS, MOHFW, GOI",
  },
];

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    doctor_name: "",
    email_address: "",
    registration_number: "",
    phone_number: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert([formData])
        .select();

      if (error) {
        throw new Error(error.message || "Failed to submit registration");
      }

      setMessage({
        type: "success",
        text: "Registration submitted successfully!",
      });

      setFormData({
        doctor_name: "",
        email_address: "",
        registration_number: "",
        phone_number: "",
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "An error occurred. Please try again.",
      });

      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl">⚖️</div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-merriweather text-center mb-2">
            KSDC WEBINAR SERIES – 2026
          </h1>
          <p className="text-center text-sm sm:text-base lg:text-lg text-slate-200 max-w-3xl mx-auto">
            Shielding the Dental Surgeon — Navigating Medico-Legal Challenges in Modern Dentistry
          </p>
          <div className="text-center text-xs sm:text-sm text-amber-300 mt-4 font-semibold tracking-wider">
            JUSTICE • TRUST • ETHICS
          </div>
          <div className="flex justify-center mt-8">
            <a
              href="#registration-form"
              className="inline-block bg-white text-slate-900 font-semibold py-3 px-8 rounded-lg hover:bg-slate-100 transition duration-300 text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              Register Now
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Section - Webinar Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sessions */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold font-merriweather text-slate-900 mb-6">
                Webinar Sessions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-5 sm:p-6 border-l-4 border-amber-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded">
                        Session {session.id}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold font-merriweather text-slate-900 mb-3 leading-snug">
                      {session.title}
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm text-slate-600 mb-3">
                      <p className="flex items-center gap-2">
                        <span className="text-amber-600 font-semibold">📅</span>
                        {session.date}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-amber-600 font-semibold">⏰</span>
                        {session.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Speakers */}
            <section className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-merriweather text-slate-900 mb-6">
                Expert Speakers
              </h2>
              <div className="space-y-6">
                {speakers.map((speaker, idx) => (
                  <div key={idx} className="pb-6 sm:pb-0 last:pb-6 sm:last:pb-0 border-b sm:border-b-0 sm:pb-6 last:border-b-0">
                    <h3 className="text-lg sm:text-xl font-bold font-merriweather text-slate-900 mb-1">
                      {speaker.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-700 font-semibold mb-2">
                      {speaker.credentials}
                    </p>
                    <p className="text-sm sm:text-base text-slate-600">
                      {speaker.position}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Overview */}
            <section className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold font-merriweather text-slate-900 mb-3">
                About This Webinar Series
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                As dental practice in Karnataka evolves, so do the legal complexities surrounding patient care. With increasing awareness of the Consumer Protection Act (CPA) and the rise in litigations, this webinar series is designed to equip dental practitioners with practical medico-legal awareness, documentation strategies, and defensive clinical approaches.
              </p>
            </section>
          </div>

          {/* Right Section - Registration Form */}
          <div className="lg:col-span-1" id="registration-form">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 sticky top-4">
              <h2 className="text-2xl font-bold font-merriweather text-slate-900 mb-2">
                Register Now
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Secure your spot in the series
              </p>

              {message && (
                <div
                  className={`mb-4 p-4 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="doctor_name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="doctor_name"
                    type="text"
                    name="doctor_name"
                    value={formData.doctor_name}
                    onChange={handleChange}
                    required
                    placeholder="Dr. John Doe"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email_address"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email_address"
                    type="email"
                    name="email_address"
                    value={formData.email_address}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="registration_number"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    KSDC Registration Number
                  </label>
                  <input
                    id="registration_number"
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    required
                    placeholder="KSDC-12345"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-12"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-4">
                We respect your privacy. Your information is secure with us.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 text-center py-6 sm:py-8 px-4 mt-12 sm:mt-16">
        <p className="text-xs sm:text-sm">
          © 2026 KSDC Webinar Series. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
