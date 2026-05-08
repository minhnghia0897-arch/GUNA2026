import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import BestSeller from "@/components/BestSeller";
import VideoSection from "@/components/VideoSection";
import Testimonial from "@/components/Testimonial";
import WhyChooseUs from "@/components/WhyChooseUs";
import Membership from "@/components/Membership";
import BlogPreview from "@/components/BlogPreview";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <BestSeller />
      <VideoSection />
      <Testimonial />
      <WhyChooseUs />
      <Membership />
      <BlogPreview />
      <ContactSection />
    </>
  );
}
