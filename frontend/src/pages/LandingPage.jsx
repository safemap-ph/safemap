import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, EyeOff, ArrowRight,
  Bot, AlertTriangle,
  CheckCircle, Lock, BarChart, Mail, Globe, Phone
} from 'lucide-react';
import logoImg from '/src/assets/images/Logo.svg';

const mapImg = 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779091696/820a9d4f-1544-4ffa-b715-6b500ddf8538_mncgoj.jpg';
const person1Img = 'https://i.pravatar.cc/150?img=1';
const person2Img = 'https://i.pravatar.cc/150?img=2';
const person3Img = 'https://i.pravatar.cc/150?img=3';
const person4Img = 'https://i.pravatar.cc/150?img=4';

/* ─── Scroll-reveal hook ─────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* ─── Inline Facebook SVG (lucide-react doesn't export it) ── */
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

/* ─── Reveal wrapper ─────────────────────────────────────── */
const Reveal = ({ children, className = "", delay = 0 }) => (
  <div className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
    {children}
  </div>
)

const LandingPage = () => {
  const navigate = useNavigate()
  useScrollReveal()

  return (
    <>
      {/* Global reveal styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div
        className="min-h-screen bg-background text-foreground selection:bg-primary/20"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Navbar ─────────────────────────────────────────── */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-gray-100">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img src={logoImg} alt="SafeMap PH" className="h-16 w-auto" />
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate("/about")}
                className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                About Us
              </button>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How it Works
              </a>
              <button
                onClick={() => navigate("/map")}
                className="px-6 py-2.5 text-white rounded-full text-sm font-semibold hover:shadow-xl transition-all active:scale-95"
                style={{ backgroundColor: "#1A2A6C" }}
              >
                View Live Map
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero Section ────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          {/* Full-bleed background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={"https://res.cloudinary.com/djc0ndwqf/image/upload/v1779094125/landing_gjkii4.jpg"}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/70" />
          </div>

          <div className="container mx-auto px-6 relative z-10 py-24">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Protecting Communities Together
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6" style={{ color: "#1A3A8F" }}>
                Vigilant Support. <br />
                <span style={{ color: "#1A3A8F" }}>Secure Anonymity.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-lg md:text-xl max-w-xl leading-relaxed mb-8" style={{ color: "#1A3A8F" }}>
                Empowering communities with real-time incident reporting and AI-driven safety analytics. Your safety is
                our mission, your identity is our secret.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  onClick={() => navigate("/map")}
                  className="px-8 py-4 text-white rounded-2xl font-bold flex items-center gap-2 hover:shadow-2xl transition-all active:scale-95 group"
                  style={{ backgroundColor: "#1A2A6C" }}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  Learn More
                </button>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[person1Img, person2Img, person3Img, person4Img].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Community member ${i + 1}`}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: "#1A3A8F" }}>
                  Joined by <span className="font-bold">1,000+</span> citizens
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Stats Section ───────────────────────────────────── */}
        <section style={{ backgroundColor: "#1A2A6C" }} className="py-20">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
            {[
              { value: "100%", label: "Anonymous Reporting" },
              { value: "<8 min", label: "Avg. Police Response Time" },
              { value: "2", label: "Partner Units (LGU & PNP)" },
              { value: "1,240+", label: "Reports Resolved" },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="space-y-2">
                  <h3 className="text-4xl font-bold">{stat.value}</h3>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── About Section ───────────────────────────────────── */}
        <section id="about" className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <Reveal className="order-2 md:order-1">
                <div className="aspect-4/3 bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
                  <img
                    src="https://res.cloudinary.com/djc0ndwqf/image/upload/v1779182728/23345_jhpd5c.png"
                    alt="About Us Illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Reveal>

              <div className="order-1 md:order-2 space-y-8">
                <Reveal>
                  <h2 className="text-4xl font-bold text-slate-900">About SafeMap PH</h2>
                </Reveal>
                <div className="space-y-6 mt-8">
                  {[
                    {
                      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
                      bg: "bg-red-50",
                      title: "The Problem",
                      text: "Fear and inadequate reporting channels often prevent incidents of abuse and harassment from reaching authorities.",
                    },
                    {
                      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                      bg: "bg-green-50",
                      title: "Our Solution",
                      text: "A secure, user-friendly, and anonymous web-based system that empowers witnesses and victims to report safely.",
                    },
                    {
                      icon: <Lock className="w-6 h-6 text-primary" />,
                      bg: "bg-primary/5",
                      title: "Speak Up Safely",
                      text: "We provide a platform where individuals can voice their concerns without the fear of exposure.",
                    },
                    {
                      icon: <BarChart className="w-6 h-6 text-blue-600" />,
                      bg: "bg-blue-50",
                      title: "Data Driven Peace of Mind",
                      text: "Our system supports decision-making by local government units (LGU) and the Philippine National Police (PNP) through verified data.",
                    },
                  ].map((item, i) => (
                    <Reveal key={i} delay={i * 100}>
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{item.title}</h4>
                          <p className="text-slate-600 text-sm">{item.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Core Pillars Section ────────────────────────────── */}
        <section className="py-24 bg-white" style={{ color: "#2d2d2d" }}>
          <div className="container mx-auto px-6">
            <Reveal className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl font-bold text-[#1A3A8F]">Our Core Pillars</h2>
              <p className="text-lg text-[#4a4a4a]">Advanced Technology serving community safety.</p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <EyeOff className="w-8 h-8 text-[#1A3A8F]" />,
                  title: "Anonymous Reporting",
                  text: "Encryption ensures your report reaches authorities without exposing your identity.",
                },
                {
                  icon: <MapPin className="w-8 h-8 text-[#1A3A8F]" />,
                  title: "Interactive Heatmap",
                  text: "Real-time visual data on community safety. Identify high-risk areas and plan your routes safely.",
                },
                {
                  icon: <Bot className="w-8 h-8 text-[#1A3A8F]" />,
                  title: "AI Assistant",
                  text: "Instant guidance and emergency protocols handled by Artificial Intelligence.",
                },
              ].map((card, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 hover:shadow-xl transition-all h-full">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8">
                      {card.icon}
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-[#1A3A8F]">{card.title}</h4>
                    <p className="text-[#4a4a4a] leading-relaxed">{card.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <Reveal className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-2">Simple & Powerful</span>
              <h2 className="text-4xl font-bold text-slate-900">How It Works</h2>
              <p className="text-lg text-slate-600 leading-relaxed">Our system is designed to be intuitive and fast, even in high-stress situations. Three powerful features working together to keep your community safe.</p>
            </Reveal>

            <div className="space-y-32 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <Reveal className="order-2 md:order-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-2xl">1</div>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">GIS Technology</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">Real-Time Incident Map (GIS)</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">Instantly visualizes incident frequency to help users avoid high-risk zones. Our Geographic Information System maps every verified report onto an interactive heatmap.</p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Color-coded heatmaps showing incident density by area</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Filter by incident type — theft, harassment, fire, and more</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Live updates as new reports are verified in real-time</span>
                    </li>
                  </ul>
                </Reveal>
                <Reveal className="order-1 md:order-2" delay={150}>
                  <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                    <img src={mapImg} alt="Real-Time Map" className="w-full h-auto" />
                  </div>
                </Reveal>
              </div>

              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <Reveal className="order-1" delay={150}>
                  <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                    <img src={"https://res.cloudinary.com/djc0ndwqf/image/upload/v1779091528/9c16a648-5bf0-43de-aaab-926839cae956.png"} alt="Anonymous Portal" className="w-full h-auto" />
                  </div>
                </Reveal>
                <Reveal className="order-2 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-2xl">2</div>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide">Zero Identity Required</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">Anonymous Portal</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">Allows for "one-click" incident reporting without requiring a name or personal ID. Your courage to report should never be limited by fear of retaliation.</p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">No registration, login, or personal data collection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Attach photos and pinpoint the exact location on a map</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Unique tracking code lets you follow up without revealing identity</span>
                    </li>
                  </ul>
                </Reveal>
              </div>

              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <Reveal className="order-2 md:order-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-2xl">3</div>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wide">AI-Powered</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">AI Safety Chatbot</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">Provides 24/7 automated support, station locators, and immediate help resources. Get instant assistance any time of day — no waiting, no hold times.</p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Instant emergency protocols and step-by-step safety guidance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Nearest police station and emergency service locator</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600">Smart categorization to connect you with the right responders</span>
                    </li>
                  </ul>
                </Reveal>
                <Reveal className="order-1 md:order-2" delay={150}>
                  <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                    <img src={"https://res.cloudinary.com/djc0ndwqf/image/upload/v1779091721/cfa7963b-bbac-46b6-82de-38ad890379b0_o3xqg3.jpg"} alt="AI Chatbot" className="w-full h-auto" />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ─────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <Reveal>
              <div className="bg-[#1A2A6C] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="relative z-10 space-y-8">
                  <h2 className="text-4xl md:text-6xl font-bold">Be a Hero in Your Community.</h2>
                  <p className="text-xl text-white/80 max-w-xl mx-auto">
                    Join the network of vigilant citizens making the Philippines safer, one report at a time.
                  </p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => navigate("/map")}
                      className="w-full md:w-auto px-10 py-5 bg-white text-[#1A2A6C] rounded-2xl font-bold text-lg hover:shadow-2xl transition-all active:scale-95"
                    >
                      Open the Map Now
                    </button>
                    <button className="w-full md:w-auto px-10 py-5 bg-[#1A2A6C] border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="py-20 border-t border-slate-100">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
              <div className="space-y-6">
                <img src={logoImg} alt="SafeMap PH" className="h-16 w-auto" />
                <p className="text-sm text-slate-500 leading-relaxed">
                  Advanced incident reporting and emergency response coordination for the Philippines.
                </p>
              </div>

              <div>
                <h5 className="font-bold mb-6">Product</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li>
                    <button onClick={() => navigate("/map")} className="hover:text-primary transition-colors">
                      Safety Map
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/report")} className="hover:text-primary transition-colors">
                      Report Incident
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/track")} className="hover:text-primary transition-colors">
                      Track Report
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold mb-6">Resources</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li>
                    <button onClick={() => navigate("/help")} className="hover:text-primary transition-colors">
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/emergency")} className="hover:text-primary transition-colors">
                      Emergency Contacts
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/privacy")} className="hover:text-primary transition-colors">
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold mb-6">Connect</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li className="flex items-center gap-3">
                    <FacebookIcon className="w-4 h-4 text-primary shrink-0" />
                    <span>SafeMap PH</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span>SafeMapPH@gmail.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary shrink-0" />
                    <span>www.SafeMapph.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span>0967 738 1793</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Jose Catolico Avenue General Santos City, 9500.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-20 pt-8 border-t border-slate-50 text-center text-sm text-slate-400">
              <p>&copy; {new Date().getFullYear()} SafeMap PH. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default LandingPage;
