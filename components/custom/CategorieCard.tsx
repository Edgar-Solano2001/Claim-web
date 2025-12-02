import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";

interface Categorie {
  urlImage: string;
  title: string;
}

interface ProductCardProps {
  categorie: Categorie;
}

export default function CategorieCard({ categorie }: ProductCardProps) {
    return (
      <>
        <Card className="w-auto rounded-4xl group hover:-translate-y-2 transition-transform duration-300 ease-out hover:shadow-lg">
          <CardHeader className="px-4 overflow-hidden rounded-md">
            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-md">
              <Image
                src={categorie.urlImage}
                alt={categorie.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className=" rounded-4xl object-cover w-full h-full transform transition-transform duration-300 ease-out hover:shadow-lg"
                quality={100}
                priority
              />
            </div>
          </CardHeader>
          <CardContent>
            <Link
              href="/"
              className="block w-full text-center text-lg font-bold hover:underline text-purple-800 dark:text-blue-300"
            >
              {categorie.title}
            </Link>
          </CardContent>
        </Card>
      </>
    );
}
