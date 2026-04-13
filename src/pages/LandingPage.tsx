import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ACCESS_CONTACT } from '../lib/access';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

const showcaseCards = [
  {
    title: 'Luxury weddings',
    copy: 'Editorial invitation pages, RSVP curation, and elegant guest management without the chaos.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
  },
  {
    title: 'Brand experiences',
    copy: 'Built for launches, private dinners, community activations, and premium in-person moments.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
  },
  {
    title: 'Cultural events',
    copy: 'Handle public RSVPs, role-based teams, and guest check-in that actually works on event day.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
  },
];

const featureStats = [
  { label: 'RSVP flows', value: 'Custom', note: 'Tailored registration questions and branded attendance journeys.' },
  { label: 'QR experience', value: 'Browser-first', note: 'Scan with any phone, open the secure link, and check guests in fast.' },
  { label: 'Team access', value: 'Role-based', note: 'Owners, managers, check-in staff, media moderators, and viewers.' },
];

const features = [
  {
    title: 'Pages that feel designed, not assembled',
    copy: 'Make the event feel premium before people even arrive, with stylish layouts, theme controls, typography choices, and cover imagery that sets the tone.',
    icon: 'auto_awesome',
  },
  {
    title: 'Check-in built for real event days',
    copy: 'No fragile embedded scanner circus. Guests receive QR links, staff authenticate when needed, and the app checks permissions before check-in.',
    icon: 'qr_code_scanner',
  },
  {
    title: 'Shared operations without the mess',
    copy: 'Invite collaborators safely, expose only the controls each role should see, and avoid the usual owner-only dashboard nonsense.',
    icon: 'groups',
  },
  {
    title: 'Media-ready guest experiences',
    copy: 'Let checked-in guests upload event moments, moderate media when needed, and keep the event page alive beyond the RSVP stage.',
    icon: 'photo_camera',
  },
];

const pricing = [
  {
    name: 'Free',
    price: '0 XAF',
    note: 'Best for trying the platform',
    cta: 'Get Access',
    href: '/login',
    dark: false,
    bullets: ['1 event', 'Basic template', 'Watermark', 'Limited capacity'],
  },
  {
    name: 'Event Pass',
    price: '15,000 XAF / event',
    note: 'For polished one-off events',
    cta: 'Request Event Pass',
    href: ACCESS_CONTACT.whatsapp,
    dark: true,
    bullets: ['Premium template', 'No watermark', 'Higher RSVP limits', 'Role-based QR check-in'],
  },
  {
    name: 'Studio',
    price: '25,000 XAF / mo',
    note: 'For recurring planners and teams',
    cta: 'Request Studio Access',
    href: ACCESS_CONTACT.whatsapp,
    dark: false,
    bullets: ['Multiple active events', 'Better analytics', 'Full data exports', 'Recurring workflow support'],
  },
  {
    name: 'Agency',
    price: 'Contract access',
    note: 'For organizations with scale',
    cta: 'Contact Sales',
    href: ACCESS_CONTACT.email,
    dark: false,
    bullets: ['Team seats', 'White-label controls', 'Priority support', 'Dedicated setup help'],
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f7f3ee] text-gray-500 font-medium">Loading...</div>;
  }

  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (!element) return;
    const offset = 88;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f3ee] text-[#171717] selection:bg-black selection:text-white">
      <div className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5 pt-3">
        <nav className="mx-auto max-w-7xl rounded-full border border-white/60 bg-white/78 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
          <div className="flex h-18 items-center justify-between px-5 sm:px-7">
            <button type="button" onClick={() => scrollToSection('home')} className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-black">
              Gerer Events
            </button>

            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-black/70">
              {[
                ['Home', 'home'],
                ['Experience', 'features'],
                ['Use Cases', 'use-cases'],
                ['Pricing', 'pricing'],
                ['Contact', 'contact'],
              ].map(([label, id]) => (
                <button key={id} type="button" onClick={() => scrollToSection(id)} className="transition-colors hover:text-black">
                  {label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-black/70 hover:text-black transition-colors">Host Login</Link>
              <Button as={Link as any} to="/login" className="rounded-full bg-[#18181B] px-6 text-white hover:bg-[#2a2a2e]">
                Get Access
              </Button>
            </div>

            <button type="button" className="lg:hidden text-black" onClick={() => setMobileMenuOpen((v) => !v)}>
              <span className="material-symbols-outlined text-[30px]">menu</span>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-black/5 px-5 py-4 lg:hidden">
              <div className="flex flex-col gap-3 text-sm font-medium text-black/75">
                {[
                  ['Home', 'home'],
                  ['Experience', 'features'],
                  ['Use Cases', 'use-cases'],
                  ['Pricing', 'pricing'],
                  ['Contact', 'contact'],
                ].map(([label, id]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      scrollToSection(id);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left"
                  >
                    {label}
                  </button>
                ))}
                <Link to="/login" className="mt-2 inline-flex items-center justify-center rounded-full bg-[#18181B] px-5 py-3 text-white">
                  Get Access
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      <header id="home" className="relative isolate overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(225,176,112,0.22),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(95,61,196,0.12),_transparent_26%),linear-gradient(180deg,_#f8f2eb_0%,_#f5efe8_42%,_#ffffff_100%)]" />
        <div className="absolute -left-20 top-32 h-64 w-64 rounded-full bg-[#d7b083]/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[#8b5cf6]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/70 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Editorial event hosting, reworked for modern teams
            </div>

            <h1 className="max-w-4xl font-display text-[2.9rem] leading-[0.96] tracking-tight text-black sm:text-[4.3rem] lg:text-[6rem]">
              Make your event page feel as good as the event itself.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-black/65 sm:text-lg">
              Gerer Events gives you a sharper way to launch invitations, manage RSVPs, coordinate collaborators, and run browser-first QR check-in without the usual event-tech ugliness.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button as={Link as any} to="/login" className="rounded-full bg-[#18181B] px-8 py-6 text-[15px] font-medium text-white hover:bg-[#2a2a2e] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                Start Hosting
              </Button>
              <a href={ACCESS_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 px-8 py-3.5 text-[15px] font-medium text-black transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)]">
                Request Contract Access
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {featureStats.map((item, index) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ delay: 0.15 + index * 0.08, duration: 0.5 }} className="rounded-[28px] border border-black/8 bg-white/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">{item.label}</p>
                  <h3 className="mt-2 font-display text-2xl text-black">{item.value}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/55">{item.note}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }} className="relative">
            <div className="relative rounded-[30px] sm:rounded-[36px] border border-white/70 bg-[#111111] p-3 sm:p-5 shadow-[0_35px_120px_rgba(0,0,0,0.22)]">
              <div className="overflow-hidden rounded-[30px]">
                <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1400" alt="Premium event crowd" className="h-[420px] w-full object-cover sm:h-[620px]" />
              </div>
              <div className="absolute inset-x-3 bottom-3 rounded-[24px] border border-white/10 bg-black/65 p-4 text-white backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:rounded-[28px] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-white/55">Live event stack</p>
                    <h3 className="mt-2 font-display text-2xl sm:text-3xl">RSVP, teams, QR, media</h3>
                  </div>
                  <div className="hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 sm:block">
                    Browser-first check-in
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3 sm:text-sm">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-white/55">Access</p>
                    <p className="mt-1 font-semibold">Contract-ready</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-white/55">Guests</p>
                    <p className="mt-1 font-semibold">Fast check-in</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-white/55">Teams</p>
                    <p className="mt-1 font-semibold">Role-based</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }} className="absolute -left-4 top-8 hidden max-w-[220px] rounded-[28px] border border-black/10 bg-white/88 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.12)] backdrop-blur md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Guest energy</p>
              <div className="mt-3 flex -space-x-3">
                {["photo-1494790108377-be9c29b29330", "photo-1500648767791-00dcc994a43e", "photo-1506794778202-cad84cf45f1d"].map((id) => (
                  <img key={id} src={`https://images.unsplash.com/${id}?w=120&h=120&fit=crop`} alt="Guest" className="h-11 w-11 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-black/60">Invitations that look premium, guest flow that stays smooth, and event-day control that does not fall apart.</p>
            </motion.div>

            <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 6.2, ease: 'easeInOut' }} className="absolute -right-3 bottom-10 hidden rounded-[28px] border border-white/55 bg-[#f1dfc7] px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.12)] md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Check-in mode</p>
              <p className="mt-2 font-display text-3xl text-[#27201a]">Door opens fast</p>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-black/45">Experience</p>
              <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-black sm:text-5xl lg:text-[3.75rem]">
                Less dashboard sludge, more event atmosphere.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-black/60">
              The landing story now matches the product story, polished visuals, rich image rhythm, stronger motion, and clearer reasons to trust the flow from invite to arrival.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-[40px] bg-[#111111] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.18)] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/45">Operational clarity</p>
                  <h3 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">Run the guest journey like it was actually designed on purpose.</h3>
                  <p className="mt-5 text-sm leading-7 text-white/65 sm:text-base">
                    From cover image to RSVP form to check-in privileges, the stack feels cleaner and more intentional, which is rare in event software and frankly embarrassing for the rest of them.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-[28px] bg-white/6">
                    <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1000" alt="Elegant dinner event" className="h-64 w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                  <div className="overflow-hidden rounded-[28px] bg-white/6 sm:translate-y-10">
                    <img src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=1000" alt="Stylish guest arrival" className="h-64 w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div key={feature.title} {...fadeUp} whileHover={{ y: -6, scale: 1.01 }} transition={{ ...fadeUp.transition, delay: index * 0.06 }} className="rounded-[32px] border border-black/8 bg-white/82 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur sm:p-7">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                    <span className="material-symbols-outlined">{feature.icon}</span>
                  </div>
                  <h3 className="font-display text-2xl text-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">{feature.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="use-cases" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-black/45">Use cases</p>
              <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-black sm:text-5xl lg:text-[3.5rem]">
                Built for events that need taste, speed, and control.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-black/60">
              Not every host needs the same atmosphere, but they all need fewer weak links, fewer confusing screens, and fewer event-day surprises.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {showcaseCards.map((card, index) => (
              <motion.div key={card.title} {...fadeUp} whileHover={{ y: -6 }} transition={{ ...fadeUp.transition, delay: index * 0.08 }} className="group overflow-hidden rounded-[36px] border border-black/8 bg-white shadow-[0_18px_70px_rgba(0,0,0,0.07)]">
                <div className="relative overflow-hidden">
                  <img src={card.image} alt={card.title} className="h-[360px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute left-5 top-5 inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                    Case study
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-2xl text-black">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">{card.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <motion.div {...fadeUp} className="rounded-[40px] border border-black/8 bg-[linear-gradient(180deg,#1a1a1d_0%,#101012_100%)] p-8 text-white shadow-[0_28px_100px_rgba(0,0,0,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/45">Why it feels different</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">A landing page that now sells the actual product, not vague startup perfume.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              Better imagery, tighter motion, cleaner sections, stronger contrast, and copy that reflects the current QR, contract, and collaboration model instead of outdated promises.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Richer image rhythm',
                'Modern layered hero',
                'More premium visual hierarchy',
                'Honest current-product messaging',
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/82">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="grid gap-6 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200" alt="Branded event registration" className="h-64 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">RSVP story</p>
                <h3 className="mt-3 font-display text-2xl text-black">Branded registration that feels intentional</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:translate-y-10">
              <img src="https://images.unsplash.com/photo-1496843916299-590492c751f4?auto=format&fit=crop&q=80&w=1200" alt="Team collaboration for events" className="h-64 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Team workflow</p>
                <h3 className="mt-3 font-display text-2xl text-black">Safer collaboration with role-aware controls</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:-translate-y-6">
              <img src="https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1200" alt="Guests arriving at event" className="h-64 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Arrival moment</p>
                <h3 className="mt-3 font-display text-2xl text-black">QR entry flow that behaves like a real-world tool</h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <img src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=1200" alt="Guests sharing event media" className="h-64 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Afterglow</p>
                <h3 className="mt-3 font-display text-2xl text-black">Guest media and event memory, with moderation when needed</h3>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-black/45">Access</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-black sm:text-5xl lg:text-[3.5rem]">
              Clear pricing, contract-ready access.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/60">
              Start small, request more access when needed, and keep the platform aligned with the way you actually sell or provision events right now.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-4">
            {pricing.map((plan, index) => {
              const isExternal = plan.href.startsWith('http') || plan.href.startsWith('mailto:');
              return (
                <motion.div key={plan.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.06 }} className={`rounded-[34px] border p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)] ${plan.dark ? 'border-black bg-[#18181B] text-white' : 'border-black/8 bg-white text-black'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${plan.dark ? 'text-white/45' : 'text-black/45'}`}>{plan.note}</p>
                  <h3 className="mt-3 font-display text-2xl">{plan.name}</h3>
                  <p className="mt-3 font-display text-3xl">{plan.price}</p>
                  <ul className={`mt-6 space-y-3 text-sm ${plan.dark ? 'text-white/75' : 'text-black/60'}`}>
                    {plan.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="material-symbols-outlined mt-0.5 text-[18px]">check_circle</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {isExternal ? (
                    <a href={plan.href} target="_blank" rel="noopener noreferrer" className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${plan.dark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#18181B] text-white hover:bg-[#2a2a2e]'}`}>
                      {plan.cta}
                    </a>
                  ) : (
                    <Link to={plan.href} className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${plan.dark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#18181B] text-white hover:bg-[#2a2a2e]'}`}>
                      {plan.cta}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <motion.div {...fadeUp} className="mx-auto max-w-7xl rounded-[32px] sm:rounded-[40px] border border-black/8 bg-white px-6 py-8 shadow-[0_18px_80px_rgba(0,0,0,0.06)] sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-black/45">Final push</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-black sm:text-5xl">Make the first impression match the standard you want guests to feel.</h2>
            <p className="mt-4 text-base leading-8 text-black/60">
              That means stronger visuals, cleaner motion, and a product story that sounds like what the app actually does today, not what some deck promised six months ago.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Button as={Link as any} to="/login" className="rounded-full bg-[#18181B] px-7 py-6 text-white hover:bg-[#2a2a2e]">
              Launch Your Event
            </Button>
            <a href={ACCESS_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#f7f3ee] px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#f1e9df]">
              Talk Access
            </a>
          </div>
        </motion.div>
      </section>

      <footer id="contact" className="border-t border-black/6 px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.6fr_0.7fr]">
          <div>
            <div className="font-display text-2xl font-semibold tracking-tight text-black">Gerer Events</div>
            <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
              A sharper event platform for modern hosts, planners, and teams who want their invite, RSVP, check-in, and collaboration flow to look premium and behave properly.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/45">Navigate</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-black/65">
              <button type="button" onClick={() => scrollToSection('features')} className="text-left hover:text-black">Experience</button>
              <button type="button" onClick={() => scrollToSection('use-cases')} className="text-left hover:text-black">Use Cases</button>
              <button type="button" onClick={() => scrollToSection('pricing')} className="text-left hover:text-black">Pricing</button>
              <Link to="/login" className="hover:text-black">Host Login</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/45">Contact</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-black/65">
              <a href={ACCESS_CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-black">WhatsApp access request</a>
              <a href={ACCESS_CONTACT.email} className="hover:text-black">Email for contract access</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-black/6 pt-6 text-sm text-black/40">
          © 2026 Gerer Events. Built for stylish real-world events, not beige software sadness.
        </div>
      </footer>
    </div>
  );
}
