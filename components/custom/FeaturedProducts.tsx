import FeaturedProductCard from "./FeaturedProductCard";

export default function FeaturedProducts() {
  const products = [
    {
      imageUrl: "/images/batman.jpg",
      title: "Figura de colección de Batman",
      description:
        "Figura de coleccion especial de batman, con su soporte y certificado de autenticidad",
    },
    {
      imageUrl: "/images/mudi.jpg",
      title: "Cuadro replica de Salvator Mundi",
      description: "Cuadro replica de 150cm x 150cm de Salvator Mundi ",
    },
    {
      imageUrl: "/images/messi.jpeg",
      title: "Autógrafo  del jugador Messi",
      description:
        "Hoja con autógrafo del jugador Messi, en tinta azul de tamaño 10cm x 10cm",
    },
    {
      imageUrl: "/images/obelisk.jpg",
      title: "Carta Obelisk the Tormentor 25th Edition",
      description:
        "Una de las tres cartas de dios egipcio en su versión aniversario.",
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold">Productos destacados</h2>

    return (
      <section className="w-full max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-[#b35def]">Productos destacados</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <FeaturedProductCard key={index} {...product} />
          ))}
        </div>
      </section>
    );
};
