import Link from "next/link";
import RecientlyViewCard from "./RecientlyViewCard";

export default function History() {

  const cards = [
    {
      imageUrl: "/images/beryl.jpg",
      title:
        "Yugioh! Primite Dragon Ether Beryl Suda-en015 1st Edi Ultra Inglés",
      description:
        "Tarjeta de Yugioh de rareza Ultra Rare extraída de la expansión Supreme Darkness",
    },

    {
      imageUrl: "/images/zeus.jpg",
      title: "Divine Arsenal AA Zeus 25th Anniversary Edition",
      description:
        "Tarjeta de Yugioh de rareza 25th Anniversary de la expansion Stampede"
    },
    {
      imageUrl: "/images/zeus.jpg",
      title: "Divine Arsenal AA Zeus 25th Anniversary Edition",
      description:
        "Tarjeta de Yugioh de rareza 25th Anniversary de la expansion Stampede"
    }
  ];

    return (
      <section className="w-full max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold">Vistos recientemente</h2>
        <div className="flex flex-col gap-6">
          {cards.map((card, index) => (
            <RecientlyViewCard key={index} {...card}/>
          ))}
        </div>

        <div className="text-xl m-8 text-center">
          <Link href="/">Ver Mas</Link>
        </div>

      </section>
    );
    
};
