import type { HomeownerProfile } from "./types";

type Props = {
  loading: boolean;
  profile: HomeownerProfile | null;
};

export default function SettingsTab({ loading, profile }: Props) {
  const [firstName = "", ...lastNameParts] = (profile?.fullName || "").split(" ");
  const lastName = lastNameParts.join(" ");

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-black">Profile Settings</h2>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <button className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#e8eaef] text-2xl font-semibold text-black/45">
            {firstName ? firstName[0] : "U"}
            <span className="absolute bottom-0 right-0 rounded-full bg-[#ff6b00] px-2 py-1 text-xs font-semibold text-white">
              Edit
            </span>
          </button>
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
          <Field label="First Name" value={loading ? "" : firstName} />
          <Field label="Last Name" value={loading ? "" : lastName} />
          <Field
            className="sm:col-span-2"
            label="Phone Number"
            value={profile?.contactPhone || ""}
            placeholder="0781234567"
            helper="Format: 07XXXXXXXX (Rwandan mobile number)"
          />
          <Field
            className="sm:col-span-2"
            label="Email"
            value={profile?.contactEmail || ""}
            placeholder="you@example.com"
          />
          <Field
            className="sm:col-span-2"
            label="Address"
            value={profile?.address || ""}
            placeholder="Enter your street address"
          />
          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-black">City</span>
            <select
              defaultValue={profile?.city || "Kigali"}
              className="mt-2 w-full rounded-lg border-0 bg-[#f0f1f3] px-4 py-3 text-sm text-black outline-none"
            >
              <option>Kigali</option>
              <option>Butare</option>
              <option>Gisenyi</option>
              <option>Musanze</option>
            </select>
          </label>
        </div>

        <button className="mt-6 w-full rounded-lg bg-[#ff6b00] px-4 py-3 text-sm font-semibold text-white">
          Save Changes
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
  label,
  placeholder,
  value,
}: {
  className?: string;
  helper?: string;
  label: string;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-black">{label}</span>
      <input
        defaultValue={value}
        placeholder={placeholder || label}
        className="mt-2 w-full rounded-lg border-0 bg-[#f0f1f3] px-4 py-3 text-sm text-black outline-none placeholder:text-black/45"
      />
      {helper ? <span className="mt-1 block text-xs text-black/45">{helper}</span> : null}
    </label>
  );
}
