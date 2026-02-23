"use client";

import ReservationEdit from "./ReservationEdit";

export default function AdminReservationEditClient({
  reservationId,
}: {
  reservationId: string;
}) {
  return <ReservationEdit reservationId={reservationId} />;
}
