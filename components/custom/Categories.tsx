import Image from "next/image";
import CategorieCard from "./CategorieCard";

export default function Categories() {
    return (
      <>
        <div className="max-w-7xl mx-auto py-16 px-6 lg:px-16 space-y-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-[#b35def]">Categorias</h1>
          </div>

          {/**Lista de categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-background border border-purple-400 dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/arte.jpg"
                alt="Subasta 1"
                width={64}
                height={64}
                className="w-16 h-16 m-4"
                priority
              />
              <p className="text-lg text- [#400c5f] dark:text-blue-300">Arte</p>
            </div>
            <div className="bg-purple-300 border border-purple-400 dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/autos.jpg"
                alt="Subasta 1"
                width={64}
                height={64}
                className="w-16 h-16 m-4"
                priority
              />
              <p className="text-lg text-[#400c5f] dark:text-blue-300">
                Automoviles
              </p>
            </div>
            <div className="bg-purple-200 border border-purple-400 dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/cartas.jpg"
                alt="Subasta 1"
                width={64}
                height={64}
                className="w-16 h-16 m-4"
                priority
              />
              <p className="text-lg text-[#400c5f] dark:text-blue-300">
                Cartas Coleccionables
              </p>
            </div>
            <div className="bg-background border border-purple-400 dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/jugetes.jpg"
                alt="Subasta 1"
                width={64}
                height={64}
                className="w-16 h-16 m-4"
                priority
              />
              <p className="text-lg text-[#400c5f] dark:text-blue-300">
                Juguetes
              </p>
            </div>
            <div className="bg-background border border-purple-400 dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/reliquias.jpg"
                alt="Subasta 1"
                width={64}
                height={64}
                className="w-16 h-16 m-4"
                priority
              />
              <p className="text-lg text-[#400c5f] dark:text-blue-300">
                Reliquias
              </p>
            </div>
            <div className="bg-background border border-purple-400 dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/joyeria.jpg"
                alt="Subasta 1"
                width={64}
                height={64}
                className="w-16 h-16 m-4"
                priority
              />
              <p className="text-lg text-[#400c5f] dark:text-blue-300">
                Joyeria
              </p>
            </div>


          </div>
        </div>
      </>
    );
};
