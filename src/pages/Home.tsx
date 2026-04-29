import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import FeaturedPackages from '../components/FeaturedPackages';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import CTABanner from '../components/CTABanner';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedPackages />
      <WhyChooseUs />
      <Testimonials />
      <CTABanner />
    </>
  );
}
