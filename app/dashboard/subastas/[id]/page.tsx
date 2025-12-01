"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";

export default function AuctionDetail({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Aquí podrías traer los datos reales desde Firebase con params.id
  const auction = {
    title: "Figura Batman",
    description: "Figura coleccionable edición limitada",
    category: "Figuras de acción",
    initialPrice: "$500",
    img: "https://m.media-amazon.com/images/I/61e0H7o1tDL.jpg",
    seller: { name: "Juan Pérez", email: "juan@mail.com", img: "https://i.pravatar.cc/100?img=5" },
    startDate: "2025-12-01",
    endDate: "2025-12-10",
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-[#15203a] text-white p-10">
        <button onClick={() => router.back()} className="mb-6 px-4 py-2 bg-purple-700 rounded hover:bg-purple-800">← Volver</button>
        <h1 className="text-3xl font-bold mb-6">Detalle de Subasta</h1>

        <div className="bg-white/10 p-6 rounded-xl mb-8 flex gap-6">
          <img src={auction.img} className="w-64 h-64 object-cover rounded" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{auction.title}</h2>
            <p className="text-gray-300 mb-2">{auction.description}</p>
            <p className="text-gray-400 mb-1"><strong>Categoría:</strong> {auction.category}</p>
            <p className="text-gray-400"><strong>Precio inicial:</strong> {auction.initialPrice}</p>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl mb-8 flex items-center gap-4">
          <img src={auction.seller.img} className="w-20 h-20 rounded-full object-cover" />
          <div>
            <h3 className="text-xl font-bold">{auction.seller.name}</h3>
            <p className="text-gray-300">{auction.seller.email}</p>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-bold mb-3">Detalles de la Subasta</h3>
          <p className="text-gray-400 mb-1"><strong>Fecha de inicio:</strong> {auction.startDate}</p>
          <p className="text-gray-400"><strong>Fecha de fin:</strong> {auction.endDate}</p>
        </div>

        <div className="flex gap-4">
          <button className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-bold transition">Aprobar Publicación</button>
          <button className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded font-bold transition">Negar Publicación</button>
        </div>
      </main>
    </div>
  );
}
