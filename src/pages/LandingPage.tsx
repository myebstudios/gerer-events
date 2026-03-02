import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // approximate navbar height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };
  return (
    <div className="antialiased overflow-x-hidden bg-white text-text-main font-sans selection:bg-primary-light selection:text-primary">
      {/* Navbar - Clean pill/floating text */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="font-display text-2xl text-black tracking-tight font-bold">Gerer Events</span>
            </div>

            {/* Center Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button type="button" onClick={() => scrollToSection('home')} className="text-black text-sm font-medium hover:text-black/70 transition-colors">Home</button>
              <button type="button" onClick={() => scrollToSection('features')} className="group relative flex items-center gap-1 cursor-pointer appearance-none bg-transparent block border-none p-0 m-0">
                <span className="text-black text-sm font-medium hover:text-black/70 transition-colors">Features</span>
              </button>
              <button type="button" onClick={() => scrollToSection('use-cases')} className="group relative flex items-center gap-1 cursor-pointer appearance-none bg-transparent block border-none p-0 m-0">
                <span className="text-black text-sm font-medium hover:text-black/70 transition-colors">Use Cases</span>
              </button>
              <button type="button" onClick={() => scrollToSection('pricing')} className="text-black text-sm font-medium hover:text-black/70 transition-colors">Pricing</button>
              <button type="button" onClick={() => scrollToSection('contact')} className="text-black text-sm font-medium hover:text-black/70 transition-colors">Contact</button>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center gap-1 text-black cursor-pointer hover:text-black/70 transition-colors">
                <span className="material-symbols-outlined text-lg">language</span>
                <span className="text-sm font-medium">English</span>
              </div>
              <Button as={Link as any} to="/login" variant="solid" className="text-sm font-medium rounded-full px-6 bg-[#18181B] text-white hover:bg-[#27272A] p-2">Register</Button>
            </div>

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button className="text-black">
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-16 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">

        {/* Little Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-full px-4 py-1.5 mb-8 z-10"
        >
          <span className="text-sm">✨</span>
          <span className="material-symbols-outlined text-[10px] text-gray-400">arrow_forward</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-green-600">done_all</span>
            <span className="text-xs font-semibold text-gray-700">Instant Check-in</span>
          </div>
          <span className="material-symbols-outlined text-[10px] text-gray-400">arrow_forward</span>
          <span className="text-sm">🎟️</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-[76px] text-black mb-6 leading-[1.1] tracking-tight font-medium">
            The smarter way<br /> to host your events.
          </h1>
          <p className="text-gray-600 text-[17px] max-w-lg mx-auto mb-10 font-normal leading-relaxed">
            Create stunning event websites, manage RSVPs seamlessly, and delight your guests from the first click to the final check-in. The ultimate end-to-end event experience.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button as={Link as any} to="/login" className="bg-[#18181B] text-white px-8 py-6 text-[15px] font-medium rounded-full hover:bg-[#27272A] inline-flex items-center gap-2">
              Get Started for Free
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Button>
            <p className="text-xs text-gray-600 flex items-center gap-1 font-medium mt-2">
              <span className="material-symbols-outlined text-[14px]">credit_card_off</span> No credit card required.
            </p>
          </div>
        </motion.div>

        {/* Logos Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-6xl mx-auto px-4 mt-24 mb-14 flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-30 grayscale"
        >
          <div className="flex items-center gap-2 font-display font-bold text-xl"><span className="material-symbols-outlined">dataset</span> Retool</div>
          <div className="flex items-center gap-2 font-display font-bold text-xl"><span className="material-symbols-outlined">wifi_tethering</span> remote</div>
          <div className="flex items-center gap-2 font-display font-bold text-xl"><span className="material-symbols-outlined">api</span> ARC</div>
          <div className="flex items-center gap-2 font-display font-bold text-xl"><span className="material-symbols-outlined">graphic_eq</span> Raycast</div>
          <div className="flex items-center gap-2 font-display font-medium text-xl"><span className="material-symbols-outlined">flight_takeoff</span> runway</div>
          <div className="flex items-center gap-2 font-display font-medium text-xl"><span className="material-symbols-outlined">trending_up</span> ramp</div>
          <div className="flex items-center gap-2 font-display font-black text-xl tracking-tighter">HEX</div>
          <div className="flex items-center gap-2 font-display font-bold text-xl"><span className="material-symbols-outlined">change_history</span> Vercel</div>
        </motion.div>

        {/* Image Grid Bottom Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full px-4 overflow-hidden relative z-10"
        >
          <div className="flex justify-center items-end gap-5 h-[320px]">
            {/* Small Image Left */}
            <div className="w-[180px] h-[220px] rounded-[32px] overflow-hidden flex-shrink-0 animate-pulse-slow outline outline-1 outline-gray-200/50">
              <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Disco Party" />
            </div>
            {/* Medium Image Left */}
            <div className="w-[200px] h-[260px] rounded-[32px] overflow-hidden flex-shrink-0 -translate-y-4 outline outline-1 outline-gray-200/50">
              <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Outdoor Event" />
            </div>
            {/* Large Center Image */}
            <div className="w-[320px] h-[320px] rounded-[48px] overflow-hidden flex-shrink-0 shadow-lg outline outline-1 outline-gray-200/50">
              <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Wedding Party" />
            </div>
            {/* Medium Image Right */}
            <div className="w-[200px] h-[260px] rounded-[32px] overflow-hidden flex-shrink-0 -translate-y-4 outline outline-1 outline-gray-200/50">
              <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Elegant Dinner" />
            </div>
            {/* Small Image Right */}
            <div className="w-[180px] h-[220px] rounded-[32px] overflow-hidden flex-shrink-0 outline outline-1 outline-gray-200/50">
              <img src="https://images.unsplash.com/photo-1533174000255-22bcae2f8dc4?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Celebration Sparklers" />
            </div>
          </div>
        </motion.div>
      </header>

      {/* Second Section: Together let's make this summer unforgettable (Image 1 style) */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left text */}
            <div className="w-full lg:w-[45%]">
              <h2 className="font-display text-5xl lg:text-[64px] text-black mb-8 leading-[1.05] tracking-tight">
                Craft your<br />
                perfect<br />
                event<br />
                experience<br />
                <span className="font-normal">with</span> <span className="text-gray-400 font-normal">powerful<br />management<br />tools.</span>
              </h2>
              <p className="text-gray-400 text-[15px] leading-relaxed mb-10 max-w-[320px] font-medium">
                Design a stunning registration flow tailored precisely to your brand. Seamlessly manage guest lists, send smart invitations, and track RSVPs without breaking a sweat.
              </p>
              <Button className="bg-[#18181B] text-white px-8 py-6 rounded-full font-medium inline-flex items-center gap-2 hover:bg-[#27272A]">
                Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Button>
            </div>

            {/* Right Images Container (Black block with images) */}
            <div className="w-full lg:w-[55%] bg-[#1A1A1A] rounded-[48px] p-8 md:p-12 relative min-h-[500px] flex items-center shadow-2xl overflow-hidden md:overflow-visible">
              {/* Floating light card over dark background */}
              <div className="hidden lg:block absolute left-[-80px] top-1/2 transform -translate-y-1/2 bg-[#DDE6E0] rounded-[32px] p-7 w-[340px] shadow-2xl z-20">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-black/40"></div>
                    <div className="w-2 h-2 rounded-full bg-black/40"></div>
                    <div className="w-2 h-2 rounded-full bg-black/40"></div>
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/50 -ml-1.5"><span className="material-symbols-outlined text-[10px] text-green-700">open_in_full</span></div>
                    <div className="w-2 h-2 rounded-full bg-black/10"></div>
                    <div className="w-2 h-2 rounded-full bg-black/10"></div>
                    <div className="w-2 h-2 rounded-full bg-black/10"></div>
                  </div>
                  <div className="bg-white/40 px-3 py-1 rounded-full"><span className="text-xs font-semibold text-black cursor-pointer">Join ›</span></div>
                </div>
                <div className="flex -space-x-3 mb-6">
                  <img className="w-11 h-11 rounded-full border-2 border-[#DDE6E0]" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="" />
                  <img className="w-11 h-11 rounded-full border-2 border-[#DDE6E0]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="" />
                  <img className="w-11 h-11 rounded-full border-2 border-[#DDE6E0]" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="" />
                </div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Event metrics updating live</p>
                <h3 className="font-display text-4xl text-[#516358] leading-tight mb-4 font-normal tracking-tight">
                  Over 500+<br />guests checked in
                </h3>
                <div className="text-right">
                  <span className="material-symbols-outlined text-gray-500 font-light text-3xl">gesture</span>
                </div>
              </div>

              {/* Images on dark background */}
              <div className="w-full flex justify-end gap-6 lg:pl-40 relative z-10 hidden sm:flex">
                <div className="w-[260px] h-[380px] rounded-[40px] overflow-hidden shadow-2xl bg-white/5">
                  <img src="https://images.unsplash.com/photo-1530103862676-de8b9de59cfa?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Lively Party" />
                </div>
                <div className="w-[320px] h-[380px] rounded-[40px] overflow-hidden shadow-2xl bg-white/5">
                  <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Dance Floor Party" />
                </div>
              </div>

              {/* Mobile image fallback */}
              <div className="w-full flex justify-center gap-4 relative z-10 sm:hidden">
                <div className="w-full h-[300px] rounded-[32px] overflow-hidden shadow-2xl bg-white/5">
                  <img src="https://images.unsplash.com/photo-1530103862676-de8b9de59cfa?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Lively Party" />
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-between w-[85%] items-center z-10">
                <span className="text-white text-lg font-medium">Real-time RSVP Tracking <span className="text-white/40 text-xs ml-3">Live</span></span>
                <div className="flex gap-1.5 opacity-40">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section: We make waves of fun & joy (Image 3 style) */}
      <section id="use-cases" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16 relative">
            <h2 className="font-display text-4xl md:text-[52px] text-black leading-[1.1] max-w-4xl mx-auto tracking-tight font-medium">
              Everything you need to run flawless events, from intimate gatherings to massive corporate <span className="text-gray-300 font-normal">summits and conferences.</span>
            </h2>
            {/* Little pill floating right */}
            <div className="absolute top-1/2 right-10 hidden lg:flex transform translate-x-10 items-center gap-1.5 bg-white border border-gray-100 shadow-sm rounded-full px-3 py-1 text-xs">
              <span className="text-sm">📅</span> <span className="material-symbols-outlined text-[10px] text-gray-400">arrow_forward</span>
              <span className="material-symbols-outlined text-sm text-green-600">how_to_reg</span>
              <span className="font-semibold text-gray-700 mx-0.5">Custom RSVPs</span>
              <span className="material-symbols-outlined text-[10px] text-gray-400">arrow_forward</span> <span className="text-sm">✨</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="col-span-1 rounded-[32px] overflow-hidden group cursor-pointer transition-all hover:opacity-95">
              <div className="w-full aspect-[4/3] md:aspect-[4/3.5] rounded-[28px] overflow-hidden mb-5">
                <img src="https://images.unsplash.com/photo-1522158637959-30385a09e01a?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-700" alt="Festival Registration" />
              </div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-display text-xl text-black font-semibold">Custom Registrations</h3>
                <span className="material-symbols-outlined text-black">arrow_forward</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-normal mb-5 px-1 pr-6">Collect exactly the data you need with custom RSVP questions and dynamic registration flows. Tailor everything to your brand.</p>
              <div className="flex -space-x-2 px-1">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="" />
              </div>
            </div>

            {/* View All Circle */}
            <div className="col-span-1 flex items-center justify-center p-8">
              <div className="w-[140px] h-[140px] rounded-full border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-black mb-2 font-light">north_east</span>
                <span className="text-sm font-semibold text-black">view all</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-span-1 rounded-[32px] overflow-hidden group cursor-pointer transition-all hover:opacity-95">
              <div className="w-full aspect-[4/3] md:aspect-[4/3.5] rounded-[28px] overflow-hidden mb-5 bg-[#F6F5F2] flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=600" className="w-[100%] h-[100%] object-cover shadow-md group-hover:scale-105 transition-transform duration-700" alt="Friends Gathering" />
              </div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-display text-xl text-black font-semibold">Smart Check-in</h3>
                <span className="material-symbols-outlined text-black">arrow_forward</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-normal px-1 pr-6">Breeze through the door. Scan QR codes instantly with our built-in check-in scanner. Syncs across all devices in real-time.</p>
            </div>

            {/* Large Card 3 */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 hidden lg:block rounded-[40px] overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Concert Crowd" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 right-6">
                <Button className="bg-[#18181B] text-white rounded-full px-6 py-4 text-sm font-medium backdrop-blur-md border border-white/10 hover:bg-[#27272A] transition-colors inline-flex items-center gap-2 shadow-xl">
                  Virtual tour <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-[52px] text-black leading-[1.1] mb-6 tracking-tight font-medium">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Start for free, upgrade when you need to. We've got a plan for every type of event host.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-display text-xl font-semibold mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-3xl font-bold">0</span>
                <span className="text-gray-500 text-sm">XAF</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> 1 event</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Basic template</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Watermarked</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Limited capacity</li>
              </ul>
              <Button as={Link as any} to="/login" className="w-full bg-gray-100 text-black hover:bg-gray-200 rounded-full font-medium">Get Started</Button>
            </div>
            {/* Event Pass */}
            <div className="bg-[#18181B] text-white p-8 rounded-[32px] border border-gray-800 shadow-xl relative transform lg:-translate-y-4">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Event Pass</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-3xl font-bold">15,000</span>
                <span className="text-gray-400 text-sm">XAF / event</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-lg">check_circle</span> Premium template</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-lg">check_circle</span> No watermark</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-lg">check_circle</span> Higher RSVP limits</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-400 text-lg">check_circle</span> Superior check-in</li>
              </ul>
              <Button as={Link as any} to="/login" className="w-full bg-white text-black hover:bg-gray-200 rounded-full font-medium">Buy Pass</Button>
            </div>
            {/* Studio */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-display text-xl font-semibold mb-2">Studio</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-3xl font-bold">25,000</span>
                <span className="text-gray-500 text-sm">XAF / mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Multiple active events</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Better analytics</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Full data exports</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> For recurring planners</li>
              </ul>
              <Button as={Link as any} to="/login" className="w-full bg-gray-100 text-black hover:bg-gray-200 rounded-full font-medium">Subscribe</Button>
            </div>
            {/* Agency */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-display text-xl font-semibold mb-2">Agency</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-3xl font-bold">75,000</span>
                <span className="text-gray-500 text-sm">XAF / mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-gray-500">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Team seats</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> White-label controls</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-lg">check_circle</span> Custom domains</li>
              </ul>
              <Button as={Link as any} to="/login" className="w-full bg-gray-100 text-black hover:bg-gray-200 rounded-full font-medium">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Quotes */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="material-symbols-outlined text-gray-300 text-5xl mb-6">format_quote</span>
          <h2 className="font-display text-3xl md:text-5xl text-black leading-tight mb-8 font-medium">
            "Gerer Events transformed how we organize our corporate summits. The guests loved the elegant invite, and check-in was literally instantaneous."
          </h2>
          <div className="flex items-center justify-center gap-3">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full object-cover" alt="Sarah J" />
            <div className="text-left">
              <p className="font-semibold text-black">Sarah Jenkins</p>
              <p className="text-sm text-gray-500">Boutique Event Planner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-column Footer Area */}
      <footer id="contact" className="bg-white pt-20 pb-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="font-display text-2xl text-black tracking-tight font-bold">Gerer Events</span>
              </div>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed mb-6 font-medium">
                The most beautiful way to invite people to real-world events. Built for modern hosts and professional organizations.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 transition-colors"><span className="material-symbols-outlined text-[18px]">language</span></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 transition-colors"><span className="material-symbols-outlined text-[18px]">mail</span></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 transition-colors"><span className="material-symbols-outlined text-[18px]">phone</span></a>
              </div>
            </div>
            <div>
              <h4 className="font-display text-black text-lg mb-6 font-semibold">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><a className="hover:text-black transition-colors" href="#">Templates</a></li>
                <li><button type="button" onClick={() => scrollToSection('features')} className="hover:text-black transition-colors appearance-none bg-transparent block border-none p-0 m-0 text-left">Features</button></li>
                <li><button type="button" onClick={() => scrollToSection('pricing')} className="hover:text-black transition-colors appearance-none bg-transparent block border-none p-0 m-0 text-left">Pricing</button></li>
                <li><Link className="hover:text-black transition-colors" to="/login">Host Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-black text-lg mb-6 font-semibold">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><a className="hover:text-black transition-colors" href="#">About Us</a></li>
                <li><button type="button" onClick={() => scrollToSection('contact')} className="hover:text-black transition-colors appearance-none bg-transparent block border-none p-0 m-0 text-left">Contact</button></li>
                <li><a className="hover:text-black transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-black transition-colors" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-sm text-gray-400 font-medium">&copy; 2026 Gerer Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
