import FeaturedProductCard from "./FeaturedProductCard";

export default function FeaturedProducts() {

    const products = [
      {
        imageUrl: "/images/blue-eyes.jpg",
        title: "Blue-Eyes White Dragon 25th Anniversary Edition",
        description:
          "Edición especial del legendario dragón blanco de ojos azules con sello holográfico.",
      },
      {
        imageUrl: "/images/dark-magician.jpg",
        title: "Dark Magician Ultra Rare",
        description:
          "Tarjeta clásica de Yugioh en su versión Ultra Rare con arte conmemorativo.",
      },
      {
        imageUrl: "/images/red-eyes.jpg",
        title: "Red-Eyes Black Dragon – Supreme Darkness",
        description:
          "Tarjeta de colección exclusiva con relieve brillante y fondo alternativo.",
      },
      {
        imageUrl: "/images/obelisk.jpg",
        title: "Obelisk the Tormentor 25th Edition",
        description:
          "Una de las tres cartas de dios egipcio en su versión aniversario.",
      },
    ];

    return (
      <section className="w-full max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold">Productos destacados</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <FeaturedProductCard key={index} {...product} />
          ))}
        </div>
      </section>
    );
};
