import React, { useState, useRef, useEffect } from "react";
import type { HomeownerProfile } from "./types";
import { updateHomeownerProfile, updateHomeownerProfileImage } from "@/lib/api";

function LocationDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locationGroups = [
    {
      label: "Kigali City - Gasabo District",
      locations: [
        "Bumbogo", "Gatsata", "Gikomero", "Gisozi", "Jabana", "Jali",
        "Kacyiru", "Kimihurura", "Kimironko", "Kinyinya", "Ndera",
        "Nduba", "Remera", "Rusororo", "Rutunga"
      ]
    },
    {
      label: "Kigali City - Kicukiro District",
      locations: [
        "Gahanga", "Gatenga", "Gikondo", "Kagarama", "Kanombe",
        "Kicukiro", "Kigarama", "Masaka", "Niboye", "Nyarugunga"
      ]
    },
    {
      label: "Kigali City - Nyarugenge District",
      locations: [
        "Gitega", "Kanyinya", "Kigali", "Kimisagara", "Mageragere",
        "Muhima", "Nyakabanda", "Nyamirambo", "Nyarugenge", "Rwezamenyo"
      ]
    },
    {
      label: "Eastern Province",
      locations: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"]
    },
    {
      label: "Northern Province",
      locations: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"]
    },
    {
      label: "Southern Province",
      locations: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"]
    },
    {
      label: "Western Province",
      locations: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"]
    }
  ];

  const filteredGroups = locationGroups.map(group => ({
    ...group,
    locations: group.locations.filter(loc =>
      loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.locations.length > 0);

  const selectedLocation = locationGroups
    .flatMap(g => g.locations)
    .find(loc => loc === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-black/15 bg-white px-3 py-2.5 text-left text-sm text-black/80 focus:border-[#ff6a00] focus:outline-none focus:ring-1 focus:ring-[#ff6a00]"
      >
        <span className={value ? "text-black" : "text-black/40"}>
          {selectedLocation || "Select your city"}
        </span>
        <svg
          className={`h-5 w-5 text-black/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-[400px] w-full overflow-y-auto rounded-xl border border-black/10 bg-white shadow-xl">
          <div className="sticky top-0 z-10 border-b border-black/5 bg-white p-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-[#f8f9fa] py-2.5 pl-10 pr-4 text-sm text-black outline-none placeholder:text-black/40 focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00]"
              />
            </div>
          </div>

          <div className="p-2">
            {filteredGroups.length === 0 ? (
              <p className="py-8 text-center text-sm text-black/60">No locations found</p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <div className="px-3 py-2 text-xs font-semibold text-black/50 uppercase tracking-wide">
                    {group.label}
                  </div>
                  {group.locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => {
                        onChange(location);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        value === location
                          ? "bg-[#ff6a00]/10 text-[#ff6a00]"
                          : "text-black/80 hover:bg-black/5"
                      }`}
                    >
                      <span>{location}</span>
                      {value === location && (
                        <svg className="h-4 w-4 text-[#ff6a00]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  loading: boolean;
  profile: HomeownerProfile | null;
  onProfileUpdate?: () => void;
};

export default function SettingsTab({ loading, profile, onProfileUpdate }: Props) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    city: "Kigali",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const [firstName = "", ...lastNameParts] = (profile?.fullName || "").split(" ");
    const lastName = lastNameParts.join(" ");
    
    setFormData({
      firstName,
      lastName,
      contactPhone: profile?.contactPhone || "",
      contactEmail: profile?.contactEmail || "",
      address: profile?.address || "",
      city: profile?.city || "Kigali",
    });
    
    setProfileImageUrl(profile?.profileImageUrl || null);
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: "error", text: "File size must be less than 5MB" });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setSaveMessage({ type: "error", text: "Only JPG, PNG, or GIF files are allowed" });
      return;
    }

    setIsUploadingImage(true);
    setSaveMessage(null);

    try {
      const response = await updateHomeownerProfileImage(file);
      if (response.success && response.imageUrl) {
        setProfileImageUrl(response.imageUrl);
        setSaveMessage({ type: "success", text: "Profile picture updated successfully!" });
        onProfileUpdate?.();
      } else {
        setSaveMessage({ type: "error", text: "Failed to upload profile picture" });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to upload profile picture" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // Validation
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // Check for entirely blank form
    if (!fullName && !formData.contactEmail && !formData.contactPhone && !formData.address) {
      setSaveMessage({ type: "error", text: "Please fill in at least one field" });
      setIsSaving(false);
      return;
    }

    // Require non-empty name
    if (!fullName) {
      setSaveMessage({ type: "error", text: "Name is required" });
      setIsSaving(false);
      return;
    }

    // Validate email format if provided
    if (formData.contactEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.contactEmail)) {
        setSaveMessage({ type: "error", text: "Please enter a valid email address" });
        setIsSaving(false);
        return;
      }
    }

    // Validate phone format if provided
    if (formData.contactPhone) {
      const phonePattern = /^07\d{8}$/;
      if (!phonePattern.test(formData.contactPhone)) {
        setSaveMessage({ type: "error", text: "Phone number must be in format 07XXXXXXXX" });
        setIsSaving(false);
        return;
      }
    }

    try {
      await updateHomeownerProfile({
        fullName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        address: formData.address,
        city: formData.city,
      });

      setSaveMessage({ type: "success", text: "Profile updated successfully!" });
      onProfileUpdate?.();
    } catch (error) {
      setSaveMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Profile Settings</h2>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#e8eaef] text-2xl font-semibold text-black/45 overflow-hidden"
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              formData.firstName ? formData.firstName[0] : "U"
            )}
            <span className="absolute bottom-0 right-0 rounded-full bg-[#ff6b00] px-2 py-1 text-xs font-semibold text-white">
              {isUploadingImage ? "..." : "Edit"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div>
            <h3 className="font-semibold text-black">Profile Picture</h3>
            <p className="text-sm text-black/55">
              Click the avatar to upload a new photo
            </p>
            <p className="mt-1 text-xs text-black/45">
              JPG, PNG or GIF, maximum 5MB
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First Name"
            value={loading ? "" : formData.firstName}
            onChange={(value) => handleChange("firstName", value)}
          />
          <Field
            label="Last Name"
            value={loading ? "" : formData.lastName}
            onChange={(value) => handleChange("lastName", value)}
          />
          <Field
            className="sm:col-span-2"
            label="Phone Number"
            value={formData.contactPhone}
            placeholder="0781234567"
            inputMode="numeric"
            helper="Format: 07XXXXXXXX (Rwandan mobile number)"
            type="tel"
            onChange={(value) => handleChange("contactPhone", value)}
          />
          <Field
            className="sm:col-span-2"
            label="Email"
            value={formData.contactEmail}
            placeholder="you@example.com"
            onChange={(value) => handleChange("contactEmail", value)}
          />
          <Field
            className="sm:col-span-2"
            label="Address"
            value={formData.address}
            placeholder="Enter your street address"
            onChange={(value) => handleChange("address", value)}
          />
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-black">City</span>
            <div className="mt-2">
              <LocationDropdown
                value={formData.city}
                onChange={(value) => handleChange("city", value)}
              />
            </div>
          </label>
        </div>

        {saveMessage && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
              saveMessage.type === "success"
                ? "border border-[#9ae6b4] bg-[#edfff4] text-[#008a3d]"
                : "border border-[#fc8181] bg-[#fff5f5] text-[#c53030]"
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving || loading}
          className="mt-6 w-full rounded-lg bg-[#ff6b00] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Account Security</h2>
        <div className="mt-5 rounded-xl border border-[#9ae6b4] bg-[#edfff4] px-4 py-3 text-sm font-medium text-[#008a3d]">
          Phone number verified
        </div>
      </section>
    </div>
  );
}

function Field({
  className = "",
  helper,
  inputMode,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  className?: string;
  helper?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-black">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || label}
        className="mt-2 w-full rounded-lg border-0 bg-[#f0f1f3] px-4 py-3 text-sm text-black outline-none placeholder:text-black/45"
      />
      {helper ? <span className="mt-1 block text-xs text-black/45">{helper}</span> : null}
    </label>
  );
}
