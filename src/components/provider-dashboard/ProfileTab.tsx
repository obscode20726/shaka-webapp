import { useState, useRef, useEffect } from "react";
import type { ProviderProfile } from "./types";
import { uploadProfilePicture, uploadPortfolioImage, fetchPaymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod, type AddPaymentMethodPayload, type PaymentMethod } from "@/lib/api";

type Props = {
  loading: boolean;
  profile: ProviderProfile | null;
};

export default function ProfileTab({ loading, profile }: Props) {
  const [activeTab, setActiveTab] = useState<"pictures" | "payment">(
    "pictures",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState<"mobile_money" | "bank_account" | "card">("mobile_money");
  const [newPaymentProvider, setNewPaymentProvider] = useState("");
  const [newPaymentAccountNumber, setNewPaymentAccountNumber] = useState("");
  const [newPaymentAccountName, setNewPaymentAccountName] = useState("");
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "payment") {
      loadPaymentMethods();
    }
  }, [activeTab]);

  const loadPaymentMethods = async () => {
    setIsLoadingPaymentMethods(true);
    setPaymentError(null);
    try {
      const methods = await fetchPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to load payment methods");
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentAccountNumber || !newPaymentAccountName) return;

    setIsAddingPaymentMethod(true);
    setPaymentError(null);

    try {
      const newMethod = await addPaymentMethod({
        type: newPaymentType,
        provider: newPaymentProvider || undefined,
        accountNumber: newPaymentAccountNumber,
        accountName: newPaymentAccountName,
      });
      setPaymentMethods((prev) => [...prev, newMethod]);
      setShowAddPaymentModal(false);
      setNewPaymentProvider("");
      setNewPaymentAccountNumber("");
      setNewPaymentAccountName("");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to add payment method");
    } finally {
      setIsAddingPaymentMethod(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to delete payment method");
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      setPaymentMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === id }))
      );
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to set default payment method");
    }
  };

  const handleProfileImageChange = async (file: File) => {
    setIsUploadingProfile(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const previewUrl = URL.createObjectURL(file);
      const result = await uploadProfilePicture(file);
      setProfileImage(result.url ?? previewUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload profile picture");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleProfileImageChange(file);
  };

  const handlePortfolioAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingPortfolio(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const uploadPromises = files.map((file) => uploadPortfolioImage(file));
      const results = await Promise.allSettled(uploadPromises);
      
      const fulfilledUrls = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<{ url: string }>).value.url);
      
      const rejectedCount = results.filter((result) => result.status === "rejected").length;
      
      if (fulfilledUrls.length > 0) {
        setPortfolioImages((prev) => [...prev, ...fulfilledUrls].slice(0, 10));
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
      
      if (rejectedCount > 0) {
        setUploadError(`${rejectedCount} image(s) failed to upload`);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload portfolio images");
    } finally {
      setIsUploadingPortfolio(false);
    }
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
          {uploadError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {uploadError}
            </p>
          )}

          {uploadSuccess && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Upload successful!
            </p>
          )}

          {/* Profile Picture card */}
          <div className="rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">📷</span>
              <div>
                <h2 className="text-base font-semibold text-black">
                  Profile Picture
                </h2>
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
                  <svg
                    className="h-8 w-8 text-black/25"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                )}
              </div>

              {/* Drop zone */}
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                disabled={isUploadingProfile}
                className={`flex flex-col items-center justify-center rounded-xl border-1 border-solid py-5 px-2 transition-colors ${
                  isDragging
                    ? "border-orange-400 bg-orange-50"
                    : "border-black/15 bg-white hover:border-black/30 hover:bg-black/2"
                } ${isUploadingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isUploadingProfile ? (
                  <p className="text-sm font-medium text-black/70">Uploading...</p>
                ) : (
                  <>
                    <svg
                      className="mb-2 h-6 w-6 text-black/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p className="text-sm font-medium text-black/70">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-0.5 text-xs text-black/40">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleProfileImageChange(e.target.files[0])
                }
              />
            </div>
          </div>

          {/* Portfolio card */}
          <div className="rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">⬆️</span>
              <div>
                <h2 className="text-base font-semibold text-black">
                  Portfolio &amp; Work Pictures
                </h2>
                <p className="text-xs text-black/50">
                  Showcase your previous work to attract more customers (up to
                  10 images)
                </p>
              </div>
            </div>

            {/* Portfolio grid */}
            <div className="mb-4 flex flex-wrap gap-3">
              {portfolioImages.map((src, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 overflow-hidden rounded-xl"
                >
                  <img
                    src={src}
                    alt={`Portfolio ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setPortfolioImages((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-black"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              {portfolioImages.length < 10 && (
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  disabled={isUploadingPortfolio}
                  className={`flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-white text-black/40 hover:border-black/30 hover:bg-black/2 transition-colors ${
                    isUploadingPortfolio ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploadingPortfolio ? (
                    <span className="mt-1 text-xs font-medium">Uploading...</span>
                  ) : (
                    <>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      <span className="mt-1 text-xs font-medium">Add Photo</span>
                    </>
                  )}
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
              <p className="mb-2 text-sm font-semibold text-black/80">
                Tips for great portfolio photos:
              </p>
              <ul className="space-y-1">
                {[
                  "Show before and after shots of your work",
                  "Include close-ups of quality craftsmanship",
                  "Use good lighting and clear images",
                  "Display variety in your completed projects",
                ].map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-1.5 text-xs text-black/55"
                  >
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
            <h2 className="text-base font-semibold text-black">
              Payment Methods
            </h2>
            <p className="mt-1 text-sm text-black/50">
              Add or manage your payment methods
            </p>

            {paymentError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {paymentError}
              </p>
            )}

            {isLoadingPaymentMethods ? (
              <p className="mt-4 text-sm text-black/60">Loading payment methods...</p>
            ) : paymentMethods.length === 0 ? (
              <p className="mt-4 text-sm text-black/60">No payment methods added yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-xl border border-black/10 bg-[#f5f6f8] p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-black">
                          {method.type === "mobile_money" && "Mobile Money"}
                          {method.type === "bank_account" && "Bank Account"}
                          {method.type === "card" && "Card"}
                        </span>
                        {method.isDefault && (
                          <span className="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-xs text-[#1f9d4a]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-black/60">
                        {method.provider && `${method.provider} • `}
                        {method.accountName} • ****{method.accountNumber?.slice(-4)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          className="text-xs font-medium text-black/60 hover:text-black"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 py-4 text-sm font-medium text-black/50 hover:border-black/30 hover:bg-black/2 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-xl font-semibold text-black">Add Payment Method</h3>

            {paymentError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {paymentError}
              </p>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="paymentType" className="block text-sm font-medium text-black">
                  Type
                </label>
                <select
                  id="paymentType"
                  value={newPaymentType}
                  onChange={(e) =>
                    setNewPaymentType(e.target.value as AddPaymentMethodPayload["type"])
                  }
                  className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                >
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="card">Card</option>
                </select>
              </div>

              {newPaymentType === "mobile_money" && (
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-black">
                    Provider
                  </label>
                  <select
                    id="provider"
                    value={newPaymentProvider}
                    onChange={(e) => setNewPaymentProvider(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                  >
                    <option value="">Select provider</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Airtel">Airtel Money</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-black">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={newPaymentAccountNumber}
                  onChange={(e) => setNewPaymentAccountNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-black">
                  Account Name
                </label>
                <input
                  id="accountName"
                  type="text"
                  value={newPaymentAccountName}
                  onChange={(e) => setNewPaymentAccountName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-[#f5f6f8] px-4 py-2 text-black"
                  placeholder="Enter account holder name"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddPaymentModal(false);
                  setNewPaymentProvider("");
                  setNewPaymentAccountNumber("");
                  setNewPaymentAccountName("");
                  setPaymentError(null);
                }}
                className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/[.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                disabled={!newPaymentAccountNumber || !newPaymentAccountName || isAddingPaymentMethod}
                className="flex-1 rounded-lg bg-[#ff6a00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddingPaymentMethod ? "Adding..." : "Add Payment Method"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
