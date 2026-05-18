import React from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Users, Heart, Target, ArrowLeft } from "lucide-react"
import logoImg from "/src/assets/images/Logo.svg"

const AboutUsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Header */}
      <nav className="border-b border-slate-100 py-6">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="SafeMap PH" className="h-8 w-auto" />
            <span className="text-lg font-bold tracking-tight text-primary">SafeMap PH</span>
          </div>
        </div>
      </nav>

      <main className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <section className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-slate-900">Making the Philippines Safer.</h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                SafeMap PH is a community-driven platform designed to modernize how we report and respond to incidents
                in our neighborhoods. Our mission is to provide a transparent, fast, and anonymous way for citizens to
                contribute to public safety.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-primary/5 rounded-3xl space-y-4">
                <Target className="w-10 h-10 text-primary" />
                <h3 className="text-2xl font-bold">Our Vision</h3>
                <p className="text-slate-600">
                  To become the standard for community safety technology in Southeast Asia, starting with the
                  Philippines.
                </p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl space-y-4 text-primary">
                <Heart className="w-10 h-10" />
                <h3 className="text-2xl font-bold text-slate-900">Our Values</h3>
                <p className="text-slate-600">
                  Privacy, transparency, and rapid response are the pillars of everything we build.
                </p>
              </div>
            </div>

            <div className="space-y-8 pt-12">
              <h2 className="text-3xl font-bold">Why SafeMap PH?</h2>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">01</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900">Anonymity First</h4>
                    <p className="text-slate-600">
                      We don't track your personal identity. We focus on the data that helps responders save lives.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">02</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900">Real-time Coordination</h4>
                    <p className="text-slate-600">
                      Our platform syncs directly with local police, fire, and medical units for the fastest possible
                      dispatch.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">03</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900">Community Empowerment</h4>
                    <p className="text-slate-600">
                      View safety trends in your area and take proactive measures to keep your family safe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-20 border-t border-slate-100 text-center space-y-8">
              <h2 className="text-3xl font-bold">Join the Movement</h2>
              <p className="text-slate-600">
                Whether you're a concerned citizen or a local authority unit, we'd love to partner with you.
              </p>
              <button
                onClick={() => navigate("/map")}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
              >
                Launch the App
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-12 bg-slate-50 mt-20">
        <div className="container mx-auto px-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} SafeMap PH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default AboutUsPage
