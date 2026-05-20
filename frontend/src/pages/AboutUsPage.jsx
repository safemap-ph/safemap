import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Globe, Phone, MapPin } from 'lucide-react';
import logoImg from '/src/assets/images/Logo.svg';

/* ---------- Scroll-reveal hook ---------- */
function useScrollReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .scale-in';
    const els = document.querySelectorAll(selectors);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ---------- Tiny helpers ---------- */
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TEAM = [
  { name: 'Manada, Jannah',   role: 'Full-Stack Developer', image: 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779100597/f1930c5b-5655-427d-8874-9436a58e2270media_editing.tmp_dao6xr.webp',   initials: 'JM', dept: 'Engineering' },
  { name: 'Soler, Germarie',  role: 'Project Manager',      image: 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779100598/received_956917833977406_htvrke.jpg',    initials: 'GS', dept: 'Management'  },
  { name: 'Ayala, Filjin',    role: 'QA Tester',            image: 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779100604/received_26239101922377527_gy8fdk.jpg',    initials: 'FA', dept: 'Quality'     },
  { name: 'Inguillo, Carlos', role: 'Product Manager',      image: 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779100598/received_1798452577448352_uphmdg.jpg', initials: 'CI', dept: 'Product'     },
  { name: 'Gregorio, Zane',   role: 'Backend Engineer',     image: 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779100598/received_1404290571381648_cpiok5.jpg', initials: 'ZG', dept: 'Engineering' },
  { name: 'Amodia, Josh',     role: 'Data Analyst',         image: 'https://res.cloudinary.com/djc0ndwqf/image/upload/v1779100597/received_853662264013633_mpiqc1.jpg',   initials: 'JA', dept: 'Analytics'   },
];

/* ---------- Main component ---------- */
const AboutUsPage = () => {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        /* Scroll-reveal base states */
        .reveal        { opacity: 0; transform: translateY(36px);   transition: opacity .7s ease, transform .7s ease; }
        .reveal-left   { opacity: 0; transform: translateX(-32px);  transition: opacity .7s ease, transform .7s ease; }
        .reveal-right  { opacity: 0; transform: translateX(32px);   transition: opacity .7s ease, transform .7s ease; }
        .scale-in      { opacity: 0; transform: scale(.92);         transition: opacity .65s ease, transform .65s ease; }

        /* Triggered state */
        .reveal.up, .reveal-left.up, .reveal-right.up, .scale-in.up {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }

        /* CTA dot-grid texture */
        .cta-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      {/* ════════════════════════════════ NAV ════════════════════════════════ */}
      <nav className="border-b border-slate-100 py-5 px-6 flex items-center justify-between sticky top-0 bg-white z-30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#1A2A6C] font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="SafeMap PH" className="h-10 w-auto" />
        </div>
      </nav>

      {/* ════════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-20 pb-16">
        {/* Eyebrow tag */}
        <div className="reveal inline-flex items-center gap-2 bg-[#EEF1FF] text-[#1A2A6C] text-sm font-bold px-4 py-2 rounded-full mb-7 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#1A2A6C]" />
          About SafeMap PH
        </div>

        {/* Heading */}
        <h1
          className="reveal text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight text-slate-900 mb-8"
          style={{ transitionDelay: '60ms' }}
        >
          Safety<br />
          Starts{' '}
          <span
            className="text-[#1A2A6C]"
            style={{ borderBottom: '4px solid #C7D0FF', paddingBottom: '2px' }}
          >
            Here.
          </span>
        </h1>

        {/* Accent divider */}
        <div
          className="reveal w-16 h-1 rounded-full bg-[#1A2A6C] mb-9"
          style={{ transitionDelay: '100ms' }}
        />

        {/* Lead */}
        <p
          className="reveal text-xl sm:text-2xl text-slate-500 leading-relaxed max-w-3xl"
          style={{ transitionDelay: '140ms' }}
        >
          SafeMap PH is a community-driven platform designed to modernize how we
          report and respond to incidents in our neighborhoods — providing a
          transparent, fast, and anonymous way for citizens to contribute to
          public safety.
        </p>
      </section>

      {/* ══════════════════════ VISION / MISSION / VALUES ════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        {/* Section label */}
        <div className="reveal mb-12">
          <p className="text-sm font-bold text-[#1A2A6C] uppercase tracking-widest mb-3">
            Our Foundation
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Vision, Mission &amp; Values
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Vision */}
          <div
            className="reveal-left relative overflow-hidden bg-[#F4F6FF] border border-[#C7D0FF] rounded-3xl p-8 sm:p-10"
            style={{ transitionDelay: '50ms' }}
          >
            <span className="absolute top-5 right-6 text-7xl font-bold select-none pointer-events-none leading-none" style={{ color: 'rgba(26,42,108,.08)' }}>
              01
            </span>
            <div className="w-14 h-14 rounded-2xl bg-[#1A2A6C] flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0D1B5E] mb-3">Our Vision</h3>
            <p className="text-base text-slate-500 leading-relaxed">
              To provide others the courage to speak up on crimes, ensuring safety
              through technological innovation and community empowerment.
            </p>
          </div>

          {/* Mission */}
          <div
            className="reveal-left relative overflow-hidden bg-[#F4F6FF] border border-[#C7D0FF] rounded-3xl p-8 sm:p-10"
            style={{ transitionDelay: '50ms' }}
          >
            <span className="absolute top-5 right-6 text-7xl font-bold select-none pointer-events-none leading-none" style={{ color: 'rgba(26,42,108,.08)' }}>
              02
            </span>
            <div className="w-14 h-14 rounded-2xl bg-[#1A2A6C] flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h3>
            <p className="text-base text-slate-500 leading-relaxed">
              To provide a reliable security system where local police stations can
              report on behalf of victims and notify officials in real time.
            </p>
          </div>

          {/* Values — full width dark card */}
          <div
            className="reveal relative overflow-hidden bg-[#1A2A6C] rounded-3xl p-8 sm:p-10 md:col-span-2"
            style={{ transitionDelay: '150ms' }}
          >
            <span className="absolute top-5 right-6 text-7xl font-bold select-none pointer-events-none leading-none" style={{ color: 'rgba(255,255,255,.08)' }}>
              03
            </span>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Our Values</h3>
            <p className="text-base text-white/70 leading-relaxed mb-5">
              The principles that guide everything we build and every decision we make.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Honesty', 'Innovation', 'Customer Focus', 'Safety', 'Accountability'].map((v) => (
                <span
                  key={v}
                  className="text-sm font-medium text-white px-4 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,.12)', border: '0.5px solid rgba(255,255,255,.2)' }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════ WHY SAFEMAP PH ════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <div className="reveal mb-12">
          <p className="text-sm font-bold text-[#1A2A6C] uppercase tracking-widest mb-3">
            Our Differentiators
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Why SafeMap PH?
          </h2>
          <p className="text-lg text-slate-500">
            Three core pillars that set us apart from traditional reporting systems.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            {
              icon: (
                <svg className="w-7 h-7 text-[#1A2A6C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ),
              title: 'Anonymity First',
              body: "We don't track your personal identity. We focus on the data that helps responders save lives — your safety starts with your privacy.",
            },
            {
              icon: (
                <svg className="w-7 h-7 text-[#1A2A6C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
              title: 'Real-time Coordination',
              body: 'Our platform syncs directly with local police, fire, and medical units for the fastest possible dispatch and incident resolution.',
            },
            {
              icon: (
                <svg className="w-7 h-7 text-[#1A2A6C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
              title: 'Community Empowerment',
              body: 'View safety trends in your area and take proactive measures. Together, we build safer neighborhoods for every Filipino family.',
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="reveal flex gap-7 items-start py-9"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#F4F6FF] flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-base text-slate-500 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════ CTA ═════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <section
          className="scale-in relative overflow-hidden bg-[#1A2A6C] rounded-3xl px-10 sm:px-16 py-20 text-center"
        >
          <div className="cta-pattern" />
          <div className="relative z-10">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(255,255,255,.1)' }}
            >
              Join the Movement
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
              Partner with<br />SafeMap PH
            </h2>
            <p className="text-white/70 text-lg sm:text-xl mb-10">
              Whether you're a concerned citizen or a local authority unit,<br />
              we'd love to connect with you.
            </p>
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-3 bg-white text-[#1A2A6C] px-9 py-4 rounded-2xl text-base font-bold transition-transform hover:scale-105 active:scale-95"
            >
              {/* Map pin icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Launch the App
            </button>
          </div>
        </section>
      </div>

      {/* ════════════════════════════ TEAM ═══════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-28">
        <div className="reveal mb-14">
          <p className="text-sm font-bold text-[#1A2A6C] uppercase tracking-widest mb-3">
            The People
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Meet the Team
          </h2>
          <p className="text-lg text-slate-500 max-w-xl">
            Product, design, engineering, and safety expertise working together
            to build a better community platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-10">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              className="reveal flex flex-col items-center text-center"
              style={{ transitionDelay: `${i * 55}ms` }}
            >
              {/* Avatar: tries image, falls back to initials */}
              <div
                className="w-36 h-36 rounded-full border-4 border-[#1A2A6C] bg-[#E8ECFF] flex items-center justify-center overflow-hidden shadow-md mb-5"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
                <span
                  className="text-[#1A2A6C] font-bold text-2xl hidden w-full h-full items-center justify-center"
                >
                  {member.initials}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
              <p className="text-base text-slate-500 mt-1">{member.role}</p>
              <span className="mt-3 inline-block bg-[#F4F6FF] text-[#1A2A6C] text-sm font-semibold px-4 py-1.5 rounded-full">
                {member.dept}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════ FOOTER ═════════════════════════════════ */}
      <footer className="border-t border-slate-100 py-20 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="reveal grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-4">
              <img src={logoImg} alt="SafeMap PH" className="h-14 w-auto" />
              <p className="text-base text-slate-400 leading-relaxed">
                Advanced incident reporting and emergency response coordination
                for the Philippines.
              </p>
            </div>

            {/* Product */}
            <div>
              <h6 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">
                Product
              </h6>
              <ul className="space-y-4 text-base text-slate-500">
                {[
                  { label: 'Safety Map',       path: '/map'     },
                  { label: 'Report Incident',  path: '/report'  },
                  { label: 'Track Report',     path: '/track'   },
                ].map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.path)}
                      className="hover:text-[#1A2A6C] transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h6 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">
                Resources
              </h6>
              <ul className="space-y-4 text-base text-slate-500">
                {[
                  { label: 'Help Center',        path: '/help'      },
                  { label: 'Emergency Contacts', path: '/emergency' },
                  { label: 'Privacy Policy',     path: '/privacy'   },
                ].map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.path)}
                      className="hover:text-[#1A2A6C] transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h6 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">
                Connect
              </h6>
              <ul className="space-y-4 text-base text-slate-500">
                <li className="flex items-center gap-3">
                  <FacebookIcon className="w-5 h-5 text-[#1A2A6C] shrink-0" />
                  SafeMap PH
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#1A2A6C] shrink-0" />
                  SafeMapPH@gmail.com
                </li>
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#1A2A6C] shrink-0" />
                  www.SafeMapph.com
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#1A2A6C] shrink-0" />
                  0967 738 1793
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1A2A6C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Jose Catolico Avenue, General Santos City, 9500.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} SafeMap PH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};  

export default AboutUsPage
