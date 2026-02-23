"use client";

import { AvailabilitySlot } from "./types";

export default function TimeSlots({
  slots,
  onSelect,
  selectedId,
}: {
  slots: AvailabilitySlot[];
  onSelect: (slot: AvailabilitySlot) => void;
  selectedId?: string | null;
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
      {slots.map((slot) => {
        const time = new Date(slot.startTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const isBooked = slot.status === "booked";
        const isSelected = selectedId === slot.id;

        return (
          <button
            key={slot.id}
            disabled={isBooked}
            onClick={() => onSelect(slot)}
            className={`
              rounded-xl px-3 py-2 text-sm font-medium transition
              ${
                isBooked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "bg-[var(--fe-green)] shadow-[0_4px_0_rgba(0,0,0,0.08)]"
                  : "bg-[var(--fe-soft)] hover:bg-[var(--fe-mauve)]"
              }
            `}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
