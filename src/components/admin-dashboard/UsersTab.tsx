import type React from "react";
import type { AdminCustomer, AdminProvider } from "./types";

type Props = {
  customers: AdminCustomer[];
  providers: AdminProvider[];
};

export default function UsersTab({ customers, providers }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <UserList title="Recent Customers">
        {customers.map((customer) => (
          <UserRow
            key={customer.id}
            avatar={customer.name[0]}
            name={customer.name}
            meta={`${customer.bookings} booking${customer.bookings === 1 ? "" : "s"}`}
          />
        ))}
      </UserList>

      <UserList title="Top Providers">
        {providers.map((provider) => (
          <UserRow
            key={provider.id}
            avatar={provider.name[0]}
            name={provider.name}
            meta={`${provider.rating} rating • ${provider.jobs} jobs`}
          />
        ))}
      </UserList>
    </div>
  );
}

function UserList({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[#d9d9df] bg-white p-6">
      <h2 className="text-base font-medium text-black">{title}</h2>
      <div className="mt-7 space-y-3">{children}</div>
    </section>
  );
}

function UserRow({
  avatar,
  meta,
  name,
}: {
  avatar: string;
  meta: string;
  name: string;
}) {
  return (
    <article className="flex items-center justify-between gap-4 rounded-lg border border-[#d9d9df] bg-white px-3 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eceef2] text-sm font-medium text-black">
          {avatar}
        </div>
        <div>
          <h3 className="text-base font-medium text-black">{name}</h3>
          <p className="text-sm text-[#4A5565]">{meta}</p>
        </div>
      </div>
      <button className="h-8 rounded-md border border-[#d9d9df] bg-white px-4 text-sm font-medium text-black hover:bg-black/[.02]">
        View
      </button>
    </article>
  );
}
