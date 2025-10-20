import Categories from "@/components/custom/Categories";
import FAQ from "@/components/custom/FAQ";
import FeaturedProducts from "@/components/custom/FeaturedProducts";
import Hero from "@/components/custom/Hero";
import History from "@/components/custom/History";

export default function Home() {
  return (
    <>
      {/**Apartado de Hero */}
      <Hero />

      {/** Apartado de productos destacados */}
      <FeaturedProducts />

      {/** Apartado de categorias*/}
      <Categories />

      {/** Apartado de preguntas frecuentes */}
      <FAQ />
    </>
  );
}
