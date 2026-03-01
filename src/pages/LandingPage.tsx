import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="antialiased overflow-x-hidden bg-ivory text-espresso">
      <nav className="fixed w-full z-50 transition-all duration-300 bg-espresso bg-opacity-95 backdrop-blur-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <span className="material-symbols-outlined text-gold text-4xl">diamond</span>
              <span className="font-serif text-2xl text-warm-ivory tracking-widest uppercase text-ivory">Gerer</span>
            </div>
            <div className="hidden md:flex items-center space-x-12">
              <a className="text-ivory hover:text-gold text-sm uppercase tracking-widest transition-colors" href="#">Solutions</a>
              <a className="text-ivory hover:text-gold text-sm uppercase tracking-widest transition-colors" href="#">Templates</a>
              <a className="text-ivory hover:text-gold text-sm uppercase tracking-widest transition-colors" href="#">Pricing</a>
              <Link className="text-ivory hover:text-gold text-sm uppercase tracking-widest transition-colors" to="/login">Log In</Link>
              <Button as={Link as any} to="/login" color="primary" variant="solid" className="uppercase text-xs font-bold tracking-widest">Start Planning</Button>
            </div>
            <div className="md:hidden">
              <button className="text-ivory">
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Elegant couple portrait" className="w-full h-full object-cover object-top opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdBGOj9vyl0NyCrDZwV0UiYjfaUvZqVr2prIGw4SyD3bEfx7FNUnJJ2kaG3We75eO5w5MSQDifgs7hFbAB0MtCNSSzKoBEBNlcs_7o7OismSEGyr_eeSoNdsSFNCp2f5BeBDAtjojqr5gWoRy37vwH528dnBmXBOibNiWOx0-cnUDgV-a5KwymlTfTFUrB6jvQgkqMezRQdt3-hTsiOp5g1PatsUDJZEoi1IHhXnsgajm-vace261JVnTRUnWe1TkVREkjHNeZw7PN"/>
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/60 via-espresso/30 to-espresso/80"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 border border-gold rounded-full flex items-center justify-center bg-espresso/50 backdrop-blur-sm">
              <span className="font-serif text-gold text-2xl italic">E&V</span>
            </div>
          </div>
          <p className="text-gold text-sm md:text-base uppercase tracking-[0.3em] mb-4">Luxury Editorial + Afro-Luxury Fusion</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-ivory mb-6 leading-tight">
            Eternal Vows
          </h1>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gold"></div>
            <p className="text-ivory text-xl md:text-2xl font-light italic font-serif">
              Two hearts, one rhythm, forever begins here.
            </p>
            <div className="h-[1px] w-12 bg-gold"></div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center mt-10">
            <Button as={Link as any} to="/login" color="primary" className="px-10 py-4 text-sm font-bold tracking-widest uppercase">Create Your Event</Button>
            <a className="border border-gold text-gold hover:bg-gold hover:text-espresso transition-all px-10 py-4 text-sm font-bold tracking-widest uppercase backdrop-blur-sm" href="#">
              View Demo
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <span className="material-symbols-outlined text-gold text-3xl">keyboard_arrow_down</span>
        </div>
      </header>

      <section className="py-24 bg-ivory relative" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23C8A96B\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="material-symbols-outlined text-clay text-5xl mb-6 font-light">all_inclusive</span>
          <h2 className="font-serif text-4xl md:text-5xl text-espresso mb-8">The Art of Gathering</h2>
          <p className="text-clay text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Gerer Events bridges the gap between digital elegance and ceremonial tradition. 
            Beautiful to share, reliable on event day, and insightful long after the last guest departs.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'10\' viewBox=\'0 0 60 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 5 L10 0 L20 5 L30 0 L40 5 L50 0 L60 5 L50 10 L40 5 L30 10 L20 5 L10 10 Z\' fill=\'%23C8A96B\' fill-opacity=\'0.4\' /%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', height: '10px' }}></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-gold uppercase tracking-widest text-sm font-bold mb-2">Process</p>
            <h2 className="font-serif text-4xl md:text-5xl text-espresso">The Guest Experience</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative p-8 border border-gold/20 hover:border-gold transition-colors duration-500 bg-ivory/30">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-espresso text-gold flex items-center justify-center font-serif text-xl rounded-full border-4 border-white">1</div>
              <div className="mt-8 text-center">
                <span className="material-symbols-outlined text-5xl text-clay mb-4 font-light">mail</span>
                <h3 className="font-serif text-2xl text-espresso mb-3">Invitation</h3>
                <p className="text-cocoa/70 text-sm leading-relaxed">
                  Share a cinematic, mobile-first invitation page that sets the tone for your luxury event.
                </p>
              </div>
            </div>
            <div className="group relative p-8 border border-gold/20 hover:border-gold transition-colors duration-500 bg-ivory/30">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-espresso text-gold flex items-center justify-center font-serif text-xl rounded-full border-4 border-white">2</div>
              <div className="mt-8 text-center">
                <span className="material-symbols-outlined text-5xl text-clay mb-4 font-light">rsvp</span>
                <h3 className="font-serif text-2xl text-espresso mb-3">RSVP</h3>
                <p className="text-cocoa/70 text-sm leading-relaxed">
                  Seamless guest confirmation with meal preferences and instant QR pass generation.
                </p>
              </div>
            </div>
            <div className="group relative p-8 border border-gold/20 hover:border-gold transition-colors duration-500 bg-ivory/30">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-espresso text-gold flex items-center justify-center font-serif text-xl rounded-full border-4 border-white">3</div>
              <div className="mt-8 text-center">
                <span className="material-symbols-outlined text-5xl text-clay mb-4 font-light">qr_code_scanner</span>
                <h3 className="font-serif text-2xl text-espresso mb-3">Check-In</h3>
                <p className="text-cocoa/70 text-sm leading-relaxed">
                  Reliable, swift entry management for your staff using our secure scanner interface.
                </p>
              </div>
            </div>
            <div className="group relative p-8 border border-gold/20 hover:border-gold transition-colors duration-500 bg-ivory/30">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-espresso text-gold flex items-center justify-center font-serif text-xl rounded-full border-4 border-white">4</div>
              <div className="mt-8 text-center">
                <span className="material-symbols-outlined text-5xl text-clay mb-4 font-light">photo_library</span>
                <h3 className="font-serif text-2xl text-espresso mb-3">Memories</h3>
                <p className="text-cocoa/70 text-sm leading-relaxed">
                  Collect and curate candid moments from guests in a private, high-resolution gallery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-espresso text-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-clay opacity-10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="relative rounded-t-full overflow-hidden border border-gold/30 shadow-2xl aspect-[3/4] max-w-md mx-auto bg-black">
                <img alt="Mobile Interface Mockup" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFZo0yLjAwSkJJACp8oni2GCXprqMLmcVVSvRBDKSd5RksIi5tt481_ZbApVZVyv8mWgpKBlkJoOK6_x6DX55rd5FEaWuDqFcvo4HitiPvSBknU4N1XODaWknMQHGqSuDKuYEXcZQy6Uv7VtR6rfVofjut3qM5vrgI52u5hFuFGxNs0CdLQA0Qt2tQyUcYUiZtvwyzF2COBDxELcKEp0MxAKnL6bQmNGXCjXvVKFg7VdSZiZNHnAy35mh38LuH1Ct6fnZPsp6ZjJ0F"/>
                <div className="absolute bottom-8 left-8 right-8 bg-ivory/95 backdrop-blur text-espresso p-6 rounded-sm shadow-lg border-l-4 border-gold">
                  <h4 className="font-serif text-xl mb-1">Adebayo & Ngozi</h4>
                  <p className="text-xs uppercase tracking-wider mb-3 text-clay">The Heritage Edition</p>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gold">calendar_month</span>
                    <span className="text-sm font-medium">Dec 14, 2024</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-gold/20 rounded-t-full -z-10"></div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="inline-block px-3 py-1 border border-gold text-gold text-xs uppercase tracking-widest mb-6">
                Featured Template
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-ivory">
                Heritage Edition
              </h2>
              <p className="text-ivory/80 text-lg leading-relaxed mb-8 font-light">
                Designed for the modern Afro-luxury wedding. The Heritage Edition combines bold typography with subtle Ndop geometric motifs. It frames your love story in espresso and aged gold, turning a simple invite into a digital heirloom.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold mt-1">check_circle</span>
                  <span className="text-ivory/90">Full-screen cinematic hero portrait</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold mt-1">check_circle</span>
                  <span className="text-ivory/90">Integrated Cultural Motifs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gold mt-1">check_circle</span>
                  <span className="text-ivory/90">Mobile-optimized editorial layout</span>
                </li>
              </ul>
              <a className="inline-flex items-center gap-2 text-gold border-b border-gold pb-1 hover:text-white hover:border-white transition-colors uppercase tracking-widest text-sm font-bold" href="#">
                Preview Template <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-espresso mb-4">Command Your Event</h2>
            <p className="text-clay">Everything you need to manage the big day with grace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-sm border-t-2 border-gold">
              <div className="h-12 w-12 bg-espresso rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-ivory">analytics</span>
              </div>
              <h3 className="font-serif text-xl text-espresso mb-2">Real-Time Analytics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track RSVP rates, meal preferences, and live check-in counts from a single elegant dashboard.
              </p>
            </div>
            <div className="bg-white p-8 shadow-sm border-t-2 border-clay">
              <div className="h-12 w-12 bg-clay rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-ivory">security</span>
              </div>
              <h3 className="font-serif text-xl text-espresso mb-2">Secure Access</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Unique QR codes for every guest ensure your private event remains exclusive and secure.
              </p>
            </div>
            <div className="bg-white p-8 shadow-sm border-t-2 border-gold">
              <div className="h-12 w-12 bg-espresso rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-ivory">folder_shared</span>
              </div>
              <h3 className="font-serif text-xl text-espresso mb-2">Media Moderation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Approve guest photos before they go live. Download full-resolution zip albums after the event.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-espresso mb-6">Begin Your Journey</h2>
          <p className="text-clay text-lg mb-12 font-light">
            Launch your event with our premium suite of tools. From "Yes" to "I Do", we handle the details.
          </p>
          <div className="bg-ivory p-8 md:p-12 border border-gold/30 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-espresso text-gold px-4 py-1 text-xs uppercase tracking-widest font-bold">
              Launch Offer
            </div>
            <h3 className="font-serif text-3xl text-espresso mb-2">The Wedding Suite</h3>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-4xl font-serif text-clay">$49</span>
              <span className="text-gray-500 text-sm">/ event</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-left max-w-lg mx-auto mb-10 text-sm text-cocoa">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg">check</span> Unlimited Guests
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg">check</span> Heritage Template
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg">check</span> QR Check-in System
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gold text-lg">check</span> 5GB Media Storage
              </div>
            </div>
            <Link className="bg-gold text-espresso hover:bg-[#b09358] transition-all px-12 py-4 inline-block text-sm font-bold tracking-widest uppercase w-full sm:w-auto" to="/login">Start Planning Now</Link>
            <p className="mt-4 text-xs text-gray-400">No credit card required for draft mode.</p>
          </div>
        </div>
      </section>

      <footer className="bg-espresso text-ivory pt-20 pb-10 border-t border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-gold text-3xl">diamond</span>
                <span className="font-serif text-2xl tracking-widest uppercase">Gerer</span>
              </div>
              <p className="text-ivory/60 max-w-sm font-light">
                Premium Afro-luxury event management for high-end weddings and social gatherings. Celebrating culture through technology.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-gold text-lg mb-6">Platform</h4>
              <ul className="space-y-3 text-sm text-ivory/70">
                <li><a className="hover:text-white transition-colors" href="#">Templates</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Pricing</a></li>
                <li><Link className="hover:text-white transition-colors" to="/login">Host Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-gold text-lg mb-6">Connect</h4>
              <ul className="space-y-3 text-sm text-ivory/70">
                <li><a className="hover:text-white transition-colors" href="#">Instagram</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Twitter</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-ivory/40">
            <p>© 2024 Gerer Events. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="hover:text-gold" href="#">Privacy Policy</a>
              <a className="hover:text-gold" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
