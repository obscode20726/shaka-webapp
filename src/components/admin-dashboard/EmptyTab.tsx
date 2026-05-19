import type { AdminTabName } from "./types";

type Props = {
  label: AdminTabName;
};

export default function EmptyTab({ label }: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center">
      <p className="text-lg font-medium text-black">{label}</p>
      <p className="mt-2 text-sm text-black/55">
        This section will be available once API integration is complete.
      </p>
    </div>
  );
}
