import HeroSection from '../components/HeroSection';
import FeaturedPackages from '../components/FeaturedPackages';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import CTABanner from '../components/CTABanner';
import PromoBanners from '../components/PromoBanners';
import PopularDestinations from '../components/PopularDestinations';
import HomeTravelReels from '../components/HomeTravelReels';

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* PromoBanners & PopularDestinations render nothing until enabled in the admin panel */}
      <PromoBanners />
      <FeaturedPackages />
      <PopularDestinations />
      <WhyChooseUs />
      {/* Renders only when active packages have enabled YouTube Shorts */}
      <HomeTravelReels />
      <Testimonials />
      <CTABanner />
    </>
  );
}
