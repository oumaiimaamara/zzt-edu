"use client";

import { useEffect, useState } from "react";
import TimeSlots from "./TimeSlots";
import { AvailabilitySlot } from "./types";

/**
 * ⚠️ MOCK TEMPORAIRE
 * sera remplacé par l’API /api/availability
 */
function generateMockSlots(date: Date): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const base = new Date(date);
  base.setHours(8, 0, 0, 0);

  for (let i = 0; i < 18; i++) {
    const start = new Date(base.getTime() + i * 30 * 60000);
    const end = new Date(start.getTime() + 30 * 60000);

    slots.push({
      id: `${start.toISOString()}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: Math.random() > 0.7 ? "booked" : "available", // mock
    });
  }

  return slots;
}

export default function AvailabilityCalendar({
  onConfirm,
}: {
  onConfirm: (slot: AvailabilitySlot) => void;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);

  useEffect(() => {
    setSelected(null);
    setSlots(generateMockSlots(date));
  }, [date]);

  return (
    <div className="mt-6 rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
      <h3 className="text-lg font-semibold text-[var(--fe-text-main)]">
        Choisir un créneau disponible
      </h3>

      {/* DATE */}
      <div className="mt-4">
        <input
          type="date"
          value={date.toISOString().split("T")[0]}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="rounded-xl border px-4 py-2"
        />
      </div>

      {/* SLOTS */}
      <TimeSlots
        slots={slots}
        selectedId={selected?.id}
        onSelect={setSelected}
      />

      {/* CONFIRM */}
      <button
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        className="
          mt-6 w-full rounded-2xl px-5 py-3 font-medium
          bg-[var(--fe-green)]
          shadow-[0_6px_0_rgba(0,0,0,0.08)]
          hover:translate-y-[1px]
          transition
          disabled:opacity-50
        "
      >
        Réserver ce créneau
      </button>
    </div>
  );
}
