import Categories from "@/components/ui/Categories";
import FeaturedProducts from "@/components/ui/FeaturedProducts";
import Hero from "@/components/ui/Hero";
import History from "@/components/ui/History";

export default function Home() {
  return (
    <>
      {/**Apartado de Hero */}
      <Hero />

    {/** Apartado de productos destacados */}
      <FeaturedProducts/>

    {/** Apartado de categorias*/}
      <Categories/>

    {/** Apartado de historial */}
      <History/>
    </>
  );
}
