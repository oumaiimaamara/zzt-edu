"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  videoTitle: string;
  status: string;
  price: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl mb-4">Mes commandes</h1>
      {orders.length === 0 ? (
        <p>Aucune commande passée.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="mb-3">
              <h2 className="font-bold">{order.videoTitle}</h2>
              <p>Statut: {order.status}</p>
              <p>Prix: {order.price} €</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
