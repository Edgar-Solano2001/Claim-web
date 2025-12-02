import CategorieCard from "./CategorieCard";

export default function Categories() {

    const categories = [
      {
        urlImage: "/images/arte.jpg",
        title: "Arte",
      },

      {
        urlImage: "/images/autos.jpg",
        title: "Automoviles",
      },

      {
        urlImage: "/images/juguetes.jpg",
        title: "Jugetes",
      },

      {
        urlImage: "/images/cartas.jpg",
        title: "Cartas Coleccionables",
      },

      {
        urlImage: "/images/reliquias.jpg",
        title: "Reliquias",
      },

      {
        urlImage: "/images/joyeria.jpg",
        title: "Joyeria",
      },
    ];

    return (
      <>
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-16 space-y-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-purple-900">
              Categorias
            </h1>
          </div>

          {/**Lista de categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {categories.map((categorie, index) => (
              <CategorieCard key={index} categorie={categorie} />
            ))}
          </div>
        </div>
      </>
    );
};
