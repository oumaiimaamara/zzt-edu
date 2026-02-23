// components/availability/types.ts
export type AvailabilitySlot = {
  id: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  status: "available" | "booked";
};
