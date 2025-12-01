"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import UserCard from "@/components/dashboard/UserCard";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface UserData {
  id: string;
  name: string;
  email: string;
  img?: string;       // puede ser undefined
  blocked: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);

      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData: UserData[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;

          usersData.push({
            id: docSnap.id,
            name: data.displayName || data.username || "Usuario sin nombre",
            email: data.email || "Sin correo",
            img: data.photoURL || undefined,   // ⬅ no usar imágenes aleatorias
            blocked: data.isActive === false,
          });
        });

        setUsers(usersData);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayCount = (n: number) => (isLoading ? "..." : n);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>

        {/* Stats */}
        <div className="flex gap-5 mb-10">
          <StatsCard
            icon="👤"
            number={displayCount(users.length)}
            label="Usuarios Registrados"
          />
          <StatsCard
            icon="⛔"
            number={displayCount(users.filter((u) => u.blocked).length)}
            label="Usuarios Bloqueados/Inactivos"
          />
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="w-full p-3 rounded bg-white/10 placeholder-gray-300 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de usuarios */}
        <div className="grid grid-cols-2 gap-6">
          {isLoading ? (
            <p className="col-span-2 text-center text-gray-400">
              Cargando usuarios...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="col-span-2 text-center text-gray-400">
              No se encontraron usuarios.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                userId={user.id}     // ⬅ **CORREGIDO**
                name={user.name}
                desc={user.email}
                img={user.img}       // ⬅ usa photoURL real
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
