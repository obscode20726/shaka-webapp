import Header from "@/components/Header";
import Hero from "@/components/Hero";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const Services = dynamic(() => import("@/components/Services"), {
  loading: () => <div className="py-12 sm:py-16 text-center">Loading services...</div>,
});

const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
  loading: () => <div className="py-12 sm:py-16 text-center">Loading how it works...</div>,
});

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="py-12 sm:py-16 text-center">Loading testimonials...</div>,
});

const CTA = dynamic(() => import("@/components/CTA"), {
  loading: () => <div className="py-12 sm:py-16 text-center">Loading CTA...</div>,
});

export default function Home() {
  return (
    <div className="bg-white text-black">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
