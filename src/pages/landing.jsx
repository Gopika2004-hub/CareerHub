import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import companies from "../data/companies.json";
import faqs from "../data/faq.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TargetIcon from "@/components/target-icon";
import LightBulbIcon from "@/components/light-bulb-icon";
import {
  Monitor,
  Megaphone,
  Paintbrush,
  Briefcase,
  Globe,
  ArrowRight,
  CheckCircle2,
  Search,
  Users,
  TrendingUp,
  Award,
  MapPin,
} from "lucide-react";
import { CATEGORY_LABELS } from "../data/categories";

// ─── Banner Slider ─────────────────────────────────────────────────────────────
function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const total = 3;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % total);
    }, 4000); // 4 seconds
    return () => clearInterval(timerRef.current);
  }, []);

  // Left-to-right: active slide at center, inactive slides wait on the left
  const slideClass = (i) =>
    i === current
      ? "opacity-100 translate-x-0 z-10"
      : "opacity-0 -translate-x-full z-0";

  return (
    <div className="relative w-screen overflow-hidden h-[800px] sm:h-[450px] lg:h-[530px]">
      {/* ── Slide 1: existing banner image ── */}
      <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${slideClass(0)}`}>
        <img src="/banner1.jpg" alt="CareerHub banner" className="w-full h-full object-cover" />
      </div>

      {/* ── Slide 2: Positions Banner ── */}
      <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${slideClass(1)}`}>
        <img src="/banner2.jpeg" alt="Open positions banner" className="w-full h-full object-cover" />
      </div>

      {/* ── Slide 3: Marketing Expert Banner ── */}
      <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${slideClass(2)}`}>
        <img src="/banner3.png" alt="Digital marketing banner" className="w-full h-full object-cover" />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300
              ${i === current ? "bg-white w-6" : "bg-white/50 w-2.5"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Category data ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: CATEGORY_LABELS[0], icon: Monitor,    bg: "bg-blue-50",   text: "text-blue-600"   },
  { label: CATEGORY_LABELS[1], icon: Megaphone,  bg: "bg-orange-50", text: "text-orange-600" },
  { label: CATEGORY_LABELS[2], icon: Paintbrush, bg: "bg-purple-50", text: "text-purple-600" },
  { label: CATEGORY_LABELS[3], icon: Briefcase,  bg: "bg-green-50",  text: "text-green-600"  },
  { label: CATEGORY_LABELS[4], icon: Globe,      bg: "bg-teal-50",   text: "text-teal-600"   },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <main className="flex flex-col gap-16 sm:gap-24 py-10">

      {/* ── BANNER SLIDER ── */}
      <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <BannerSlider />
      </section>

      {/* ── ABOUT US ── */}
      <section className="px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white
                        rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12">
          {/* LEFT: image */}
          <div className="relative rounded-2xl overflow-hidden shadow-md">
            <img
            src="about.png"
            alt="About CareerHub"
            className="w-full h-[96px] sm:h-[500px] object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#00529b]/80 to-transparent">              
            </div>
          </div>

          {/* RIGHT: text content */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#00529b]">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-black mt-2 leading-snug">
                CareerHub Job Portal
              </h2>
            </div>
            <p className="text-gray-800 text-base leading-relaxed">
              We are a dynamic job portal dedicated to connecting talented individuals with the right career
              opportunities. Our platform is designed to bridge the gap between job seekers and employers by
              providing a seamless, efficient, and user-friendly recruitment experience.
            </p>
            <p className="text-gray-800 text-base leading-relaxed">
              Through smart job matching, real-time applications, and a streamlined hiring process, we empower
              candidates to discover roles that align with their skills and ambitions, while helping employers
              find the best talent quickly and effectively.
            </p>
            <ul className="flex flex-col gap-2 mt-1">
              {["Smart Job Matching", "Real-Time Applications", "Streamlined Hiring Process"].map(pt => (
                <li key={pt} className="flex items-center gap-2 text-black text-sm font-medium">
                  <CheckCircle2 size={17} className="text-[#00529b] flex-shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link
              to="/jobs"
              className="mt-2 self-start inline-flex items-center gap-2 bg-[#00529b] hover:bg-[#003d75]
                         text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Explore Jobs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMPANY CAROUSEL ── */}
      <div className="w-full bg-white py-6 rounded-lg px-4 mb-8">
        <div className="flex justify-center mb-6">
  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 text-center">
    Trusted by leading companies
  </h2>
</div>
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full"
        >
          <CarouselContent className="flex gap-5 sm:gap-20 items-center">
            {companies.map(({ name, id, path }) => (
              <CarouselItem key={id} className="basis-1/3 lg:basis-1/6">
                <div className="flex h-full w-full items-center justify-center rounded-3xl border border-slate-200/60 bg-white p-4">
                  <img
                    src={path}
                    alt={name}
                    className="h-9 sm:h-14 object-contain"
                    style={{
                      filter:
                        name?.toLowerCase() === "ibm" ||
                        name?.toLowerCase() === "uber"
                          ? "invert(1)"
                          : "none",
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* ── EXPLORE BY CATEGORY ── */}
      <section className="px-4 sm:px-8 lg:px-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            Explore by Category
          </h2>
          <p className="text-slate-500 mt-2 text-base max-w-xl mx-auto">
            Find the right opportunity from our top job categories
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {CATEGORIES.map(({ label, icon: Icon, bg, text }) => (
            <Link
              key={label}
              to={`/jobs?category=${encodeURIComponent(label)}`}
              className="group flex flex-col items-center justify-center gap-5 py-10 px-6
                         rounded-2xl bg-white border-2 border-gray-200 shadow-sm
                         hover:border-[#00529b] hover:shadow-xl hover:-translate-y-2
                         transition-all duration-300 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${bg} ${text}
                               group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={30} />
              </div>
              <span className="text-sm font-bold text-slate-700 leading-snug">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="px-4 sm:px-8 lg:px-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
            Our Purpose
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Our Mission */}
          <div
            className="flex flex-col items-center text-center p-8 rounded-2xl shadow-sm
                       bg-white border-2 border-transparent
                       hover:border-[#00529b] hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-6 p-4 rounded-full bg-blue-50">
              <TargetIcon className="w-12 h-12 text-[#00529b]" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Our Mission</h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              To connect talented job seekers with their perfect career opportunities and empower employers
              to find the best candidates efficiently.
            </p>
          </div>

          {/* Our Vision */}
          <div
            className="flex flex-col items-center text-center p-8 rounded-2xl shadow-sm
                       bg-white border-2 border-transparent
                       hover:border-[#00529b] hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-6 p-4 rounded-full bg-blue-50">
              <LightBulbIcon className="w-12 h-12 text-[#00529b]" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Our Vision</h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              To revolutionize how people find jobs and companies hire, creating a seamless and efficient
              job marketplace for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* ── INFO CARDS ── */}
      <section className="px-4 sm:px-8 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="font-bold">For Job Seekers</CardTitle></CardHeader>
          <CardContent>Search and apply for jobs, track applications, and more.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-bold">For Employers</CardTitle></CardHeader>
          <CardContent>Post jobs, manage applications, and find the best candidates.</CardContent>
        </Card>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 sm:px-8 lg:px-16">
        <Accordion type="multiple" className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

    </main>
  );
};

export default LandingPage;


