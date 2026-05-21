import Image from "next/image";
import Link from "next/link";

type Props = {
  onLogout: () => void;
};

export default function DashboardHeader({ onLogout }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-7">
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-3 text-base font-medium text-black hover:text-black/70"
        >
          <Image
            src="/icons/back.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span>Back</span>
        </Link>
        <div>
          <h1 className="text-[30px] font-semibold leading-tight text-black">
            Admin Dashboard
          </h1>
          <p className="text-base leading-6 text-[#4A5565]">
            Monitor platform activity and manage operations
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-1 inline-flex h-9 items-center gap-3 rounded-lg border border-[#ff6467] bg-white px-4 text-sm font-medium text-[#fb2c36] hover:bg-red-50"
      >
        <Image
          src="/icons/logout.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
        />
        <span>Logout</span>
      </button>
    </div>
  );
}
