type Props = {
  label: string;
};

export default function EmptyTab({ label }: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-center">
      <p className="text-sm text-black/60">{label} tab coming soon.</p>
    </div>
  );
}
