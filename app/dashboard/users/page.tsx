"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import UserCard from "@/components/dashboard/UserCard";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";


interface UserData {
  id: string;
  name: string;
  email: string;
  img: string;
  blocked: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener usuarios de Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        usersData.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          img: data.img || "https://i.pravatar.cc/150",
          blocked: data.blocked || false,
        });
      });
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>

        {/* Estadísticas rápidas */}
        <div className="flex gap-5 mb-10">
          <StatsCard icon="👤" number={users.length} label="Usuarios Registrados" />
          <StatsCard
            icon="⛔"
            number={users.filter((u) => u.blocked).length}
            label="Usuarios Bloqueados"
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
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              desc={user.email}
              img={user.img}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
