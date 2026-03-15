import Header from "@/components/Header";
import ProviderRegistration from "@/components/ProviderRegistration";
import Footer from "@/components/Footer";

export default function ProviderSignupPage() {
  return (
    <div className="bg-white text-black">
      <Header />
      <main>
        <ProviderRegistration />
      </main>
      <Footer />
    </div>
  );
}
