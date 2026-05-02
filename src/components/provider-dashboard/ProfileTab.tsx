import { useState, useRef } from "react";
import type { ProviderProfile } from "./types";

type Props = {
  loading: boolean;
  profile: ProviderProfile | null;
};

export default function ProfileTab({ loading, profile }: Props) {
  const [activeTab, setActiveTab] = useState<"pictures" | "payment">("pictures");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleProfileImageChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setProfileImage(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleProfileImageChange(file);
  };

  const handlePortfolioAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPortfolioImages((prev) => [...prev, ...urls].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-white/90 text-black">
      {/* Page header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-black/90">Settings</h1>
        <p className="mt-1 text-sm text-black/45">
          Manage your profile pictures and payment methods
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mx-4 mb-5 flex rounded-full bg-[#eff1f4] p-1">
        <button
          onClick={() => setActiveTab("pictures")}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            activeTab === "pictures"
              ? "bg-white text-black"
              : "text-black/60 hover:text-black"
          }`}
        >
          Pictures
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            activeTab === "payment"
              ? "bg-white text-black"
              : "text-black/60 hover:text-black"
          }`}
        >
          Payment Methods
        </button>
      </div>

      {activeTab === "pictures" && (
        <div className="space-y-4 px-4 pb-28">
          {/* Profile Picture card */}
          <div className="rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">📷</span>
              <div>
                <h2 className="text-base font-semibold text-black">Profile Picture</h2>
                <p className="text-xs text-black/50">
                  This picture will be shown to customers on your profile
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              {/* Preview circle */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-black/8">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <svg className="h-8 w-8 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                )}
              </div>

              {/* Drop zone */}
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex  flex-col items-center justify-center rounded-xl border-1 border-solid py-5 px-2 transition-colors ${
                  isDragging
                    ? "border-orange-400 bg-orange-50"
                    : "border-black/15 bg-white hover:border-black/30 hover:bg-black/2"
                }`}
              >
                <svg className="mb-2 h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm font-medium text-black/70">Click to upload or drag and drop</p>
                <p className="mt-0.5 text-xs text-black/40">PNG, JPG up to 5MB</p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleProfileImageChange(e.target.files[0])}
              />
            </div>
          </div>

          {/* Portfolio card */}
          <div className="rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">⬆️</span>
              <div>
                <h2 className="text-base font-semibold text-black">Portfolio &amp; Work Pictures</h2>
                <p className="text-xs text-black/50">
                  Showcase your previous work to attract more customers (up to 10 images)
                </p>
              </div>
            </div>

            {/* Portfolio grid */}
            <div className="mb-4 flex flex-wrap gap-3">
              {portfolioImages.map((src, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl">
                  <img src={src} alt={`Portfolio ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => setPortfolioImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-black"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {portfolioImages.length < 10 && (
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-white text-black/40 hover:border-black/30 hover:bg-black/2 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="mt-1 text-xs font-medium">Add Photo</span>
                </button>
              )}
            </div>
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePortfolioAdd}
            />

            {/* Tips box */}
            <div className="rounded-xl bg-[#EFF6FF] border-[#BEDBFF] border-[1px] px-4 py-3">
              <p className="mb-2 text-sm font-semibold text-black/80">Tips for great portfolio photos:</p>
              <ul className="space-y-1">
                {[
                  "Show before and after shots of your work",
                  "Include close-ups of quality craftsmanship",
                  "Use good lighting and clear images",
                  "Display variety in your completed projects",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5 text-xs text-black/55">
                    <span className="mt-0.5 text-orange-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="px-4 pb-28">
          <div className="rounded-2xl bg-white p-5">
            <h2 className="text-base font-semibold text-black">Payment Methods</h2>
            <p className="mt-1 text-sm text-black/50">Add or manage your payment methods</p>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 py-4 text-sm font-medium text-black/50 hover:border-black/30 hover:bg-black/2 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      
  );
}