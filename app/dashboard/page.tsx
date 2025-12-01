'use client';

import React, { useState, useEffect } from 'react';

// Firebase
import { db } from '@/app/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';

// Componentes
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import UserCard from "@/components/dashboard/UserCard";
import AuctionCard from "@/components/dashboard/AuctionCard";


// ---------------------------------------------------------
// 1. INTERFACES Y FUNCIÓN PARA LOS CONTADORES
// ---------------------------------------------------------
interface DashboardCounts {
  registeredUsers: number;
  productsInReview: number;
  activeAuctions: number;
}

async function fetchDashboardCounts(firestoreDb: Firestore): Promise<DashboardCounts> {
  try {
    const usersRef = collection(firestoreDb, "users");
    const usersSnapshot = await getDocs(usersRef);

    const activeAuctionsQuery = query(
      collection(firestoreDb, "auctions"),
      where("status", "==", "active")
    );
    const activeAuctionsSnapshot = await getDocs(activeAuctionsQuery);

    const reviewProductsQuery = query(
      collection(firestoreDb, "auctions"),
      where("status", "==", "review")
    );
    const reviewProductsSnapshot = await getDocs(reviewProductsQuery);

    return {
      registeredUsers: usersSnapshot.size,
      activeAuctions: activeAuctionsSnapshot.size,
      productsInReview: reviewProductsSnapshot.size,
    };

  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    return { registeredUsers: 0, activeAuctions: 0, productsInReview: 0 };
  }
}



// ---------------------------------------------------------
// 2. COMPONENTE PRINCIPAL
// ---------------------------------------------------------
export default function DashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({
    registeredUsers: 0,
    productsInReview: 0,
    activeAuctions: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // 👇 NUEVOS ESTADOS
  const [latestUsers, setLatestUsers] = useState<any[]>([]);
  const [latestAuctions, setLatestAuctions] = useState<any[]>([]);


  // ---------------------------------------------------------
  // LOAD COUNTS
  // ---------------------------------------------------------
  useEffect(() => {
    const loadCounts = async () => {
      setIsLoading(true);
      const data = await fetchDashboardCounts(db);
      setCounts(data);
      setIsLoading(false);
    };

    loadCounts();
  }, []);


  // ---------------------------------------------------------
  // 🔥 CARGAR ÚLTIMOS USUARIOS Y SUBASTAS
  // ---------------------------------------------------------
  useEffect(() => {
    const loadLatestData = async () => {
      try {
        // Últimos usuarios (2)
        const usersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(2)
        );
        const usersSnap = await getDocs(usersQuery);
        setLatestUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Últimas subastas (2)
        const auctionsQuery = query(
          collection(db, "auctions"),
          orderBy("createdAt", "desc"),
          limit(2)
        );
        const auctionsSnap = await getDocs(auctionsQuery);
        setLatestAuctions(auctionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error("Error cargando actividad reciente:", err);
      }
    };

    loadLatestData();
  }, []);


  const getCount = (count: number) => (isLoading ? '...' : count);


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold">Sea Bienvenido Administrador</h1>

        {/* Stats */}
        <div className="flex gap-5 mt-6">
          <StatsCard icon="👤" number={getCount(counts.registeredUsers)} label="Usuarios Registrados" />
          <StatsCard icon="🛍️" number={getCount(counts.productsInReview)} label="Productos en Revisión" />
          <StatsCard icon="👁️" number={getCount(counts.activeAuctions)} label="Subastas Activas" />
        </div>


        {/* ACTIVIDAD RECIENTE */}
        <h2 className="text-2xl font-bold mt-10">Actividad Reciente</h2>

        <div className="grid grid-cols-2 gap-10 mt-5">

          {/* 🔥 ÚLTIMOS USUARIOS */}
          <div>
            <h3 className="text-xl mb-3">Últimos Usuarios Registrados</h3>

            {latestUsers.length === 0 && (
              <p className="text-gray-400">No hay usuarios recientes.</p>
            )}

            {latestUsers.map(user => (
              <UserCard
                key={user.id}
                userId={user.id}
                name={user.name}
                desc={user.email}
                img={user.photoURL || "https://i.pravatar.cc/150"}
              />
            ))}
          </div>


          {/* 🔥 ÚLTIMAS SUBASTAS */}
          <div>
            <h3 className="text-xl mb-3">Últimas Subastas Creadas</h3>

            {latestAuctions.length === 0 && (
              <p className="text-gray-400">No hay subastas recientes.</p>
            )}

            {latestAuctions.map(auction => (
              <AuctionCard
                key={auction.id}
                img={auction.image || auction.images?.[0] || "/noimage.png"}
                title={auction.title}
                price={`$${auction.currentPrice}`}
              />
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
