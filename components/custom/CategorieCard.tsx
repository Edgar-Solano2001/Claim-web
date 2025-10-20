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
      <Card className="w-auto group hover:-translate-y-2 transition-transform duration-300 ease-out hover:shadow-lg">
        <CardHeader className="px-4 overflow-hidden rounded-md">
          <Image
            src={categorie.urlImage}
            alt={categorie.title}
            width={160}
            height={160}
            className="h-50 w-full object-cover rounded-md transform transition-transform duration-300 ease-out hover:shadow-lg"
            priority
          />
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className="block w-full text-center text-lg font-medium hover:underline"
          >
            {categorie.title}
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
