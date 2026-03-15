import Header from "@/components/Header";
import WelcomeChoice from "@/components/WelcomeChoice";
import Footer from "@/components/Footer";

export default function GetStartedPage() {
  return (
    <div className="bg-white text-black">
      <Header />
      <main>
        <WelcomeChoice />
      </main>
      <Footer />
    </div>
  );
}
