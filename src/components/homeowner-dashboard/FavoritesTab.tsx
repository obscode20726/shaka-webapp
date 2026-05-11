import { fullName } from "./formatters";
import type { ServiceRequest } from "./types";

type Props = {
  requests: ServiceRequest[];
  statsLoading: boolean;
};

export default function FavoritesTab({ requests, statsLoading }: Props) {
  const favoriteProviders = requests
    .filter((request) => request.provider)
    .reduce<
      {
        key: string;
        name: string;
        service: string;
        city: string;
        completed: number;
      }[]
    >((providers, request) => {
      const name = fullName(request.provider);
      const existing = providers.find((provider) => provider.key === name);
      if (existing) {
        existing.completed += request.status === "completed" ? 1 : 0;
        return providers;
      }
      providers.push({
        key: name,
        name,
        service: request.service?.title || "Service provider",
        city: request.city,
        completed: request.status === "completed" ? 1 : 0,
      });
      return providers;
    }, []);

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-black">Favorite Providers</h2>
      <p className="text-sm text-black/55">
        Rebook providers you have worked with before
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {statsLoading ? (
          <p className="py-8 text-sm text-black/60">Loading favorites...</p>
        ) : favoriteProviders.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-black/15 bg-white p-6 text-sm text-black/60 md:col-span-2">
            Providers will appear here after they accept or complete your
            service requests.
          </section>
        ) : (
          favoriteProviders.map((provider) => (
            <article
              key={provider.key}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-sm font-semibold text-black">
                  {provider.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-black">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-black/55">{provider.service}</p>
                  <p className="mt-1 text-xs text-black/45">
                    {provider.city} - {provider.completed} completed job
                    {provider.completed === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="rounded-lg bg-[#ff6b00] px-4 py-2 text-sm font-semibold text-white">
                  Book Again
                </button>
                <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium text-black/75">
                  Message
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
