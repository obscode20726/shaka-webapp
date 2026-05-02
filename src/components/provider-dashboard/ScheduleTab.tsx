import type React from "react";
import type { Availability, Booking } from "./types";

type Props = {
  availability: Availability;
  bookings: Booking[];
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  statsLoading: boolean;
};

export default function ScheduleTab({
  availability,
  bookings,
  setAvailability,
  statsLoading,
}: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-black">
        Availability Settings
      </h2>
      <p className="mt-1 text-sm text-black/55">
        Set your weekly availability to receive relevant booking requests
      </p>

      <div className="mt-5 space-y-3">
        {Object.entries(availability).map(([day, config]) => (
          <AvailabilityRow
            key={day}
            config={config}
            day={day}
            setAvailability={setAvailability}
          />
        ))}
      </div>

      <UpcomingBookings bookings={bookings} statsLoading={statsLoading} />

      <button
        type="button"
        onClick={() => alert("Availability saved (UI only for now).")}
        className="mt-6 inline-flex items-center rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white hover:bg-black"
      >
        Save Availability
      </button>
    </div>
  );
}

function AvailabilityRow({
  config,
  day,
  setAvailability,
}: {
  config: Availability[string];
  day: string;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
}) {
  const updateDay = (patch: Partial<Availability[string]>) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="w-[90px] text-sm font-medium text-black">{day}</span>
        <button
          type="button"
          aria-label={`toggle ${day} availability`}
          onClick={() => updateDay({ enabled: !config.enabled })}
          className={`relative h-5 w-9 rounded-full ${
            config.enabled ? "bg-[#0f172a]" : "bg-black/20"
          }`}
        >
          <span
            className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-all ${
              config.enabled ? "right-[2px]" : "left-[2px]"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="time"
          value={config.start}
          disabled={!config.enabled}
          onChange={(event) => updateDay({ start: event.target.value })}
          className="w-[120px] rounded-lg border border-black/10 bg-[#f5f6f8] px-3 py-2 text-sm text-black disabled:opacity-50"
        />
        <span className="text-sm text-black/50">to</span>
        <input
          type="time"
          value={config.end}
          disabled={!config.enabled}
          onChange={(event) => updateDay({ end: event.target.value })}
          className="w-[120px] rounded-lg border border-black/10 bg-[#f5f6f8] px-3 py-2 text-sm text-black disabled:opacity-50"
        />
      </div>
    </div>
  );
}

function UpcomingBookings({
  bookings,
  statsLoading,
}: {
  bookings: Booking[];
  statsLoading: boolean;
}) {
  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.scheduledAt) > new Date())
    .slice(0, 5);

  return (
    <div className="mt-8 rounded-2xl border border-black/10 bg-white p-4">
      <h3 className="text-sm font-semibold text-black">Upcoming bookings</h3>
      <div className="mt-3 space-y-2">
        {statsLoading ? (
          <p className="py-2 text-sm text-black/60">Loading...</p>
        ) : upcomingBookings.length === 0 ? (
          <p className="py-2 text-sm text-black/60">
            No upcoming bookings yet.
          </p>
        ) : (
          upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-black">Booking</p>
                <p className="text-xs text-black/60">
                  {new Date(booking.scheduledAt).toLocaleString()}
                </p>
              </div>
              <span className="rounded-full bg-[#eaf2ff] px-2 py-0.5 text-xs text-[#2a73d9]">
                {booking.escrowStatus}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
