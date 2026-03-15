import Header from "@/components/Header";
import HomeownerRegistration from "@/components/HomeownerRegistration";
import Footer from "@/components/Footer";

export default function HomeownerSignupPage() {
  return (
    <div className="bg-white text-black">
      <Header />
      <main>
        <HomeownerRegistration />
      </main>
      <Footer />
    </div>
  );
}

