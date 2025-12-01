import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import UserCard from "@/components/dashboard/UserCard";
import AuctionCard from "@/components/dashboard/AuctionCard";

export default function DashboardPage() {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 bg-[#15203a] text-white p-10">
        <h1 className="text-3xl font-bold">Sea Bienvenido Administrador</h1>

        {/* Stats */}
        <div className="flex gap-5 mt-6">
          <StatsCard icon="👤" number={35} label="Usuarios Registrados" />
          <StatsCard icon="🛍️" number={20} label="Productos en Revisión" />
          <StatsCard icon="👁️" number={10} label="Subastas Activas" />
        </div>

        <h2 className="text-2xl font-bold mt-10">Actividad Reciente</h2>

        <div className="grid grid-cols-2 gap-10 mt-5">
          
          {/* Usuarios */}
          <div>
            <h3 className="text-xl mb-3">Últimos Usuarios Registrados</h3>

            <UserCard 
              name="Usuario 1"
              desc="Descripción del usuario"
              img="https://i.pravatar.cc/150?img=3"
            />

            <UserCard 
              name="Usuario 2"
              desc="Descripción del usuario"
              img="https://i.pravatar.cc/150?img=5"
            />
          </div>

          {/* Subastas */}
          <div>
            <h3 className="text-xl mb-3">Últimas Subastas Creadas</h3>

            <AuctionCard 
              img="https://i.ebayimg.com/images/g/AAkAAOSw7rtiGOUY/s-l1600.jpg"
              title="Yugioh Primite Dragon Ether"
              price="$399 MXN"
            />

            <AuctionCard 
              img="https://m.media-amazon.com/images/I/61e0H7o1tDL.jpg"
              title="Figura Batman Knightfall McFarlane"
              price="$780 MXN"
            />
          </div>

        </div>
      </main>

    </div>
  );
}
