import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoriaTitle } from "@/lib/categorias";

interface AuctionCardProps {
  id: string | number;
  title: string;
  category: string;
  price: number;
  image: string;
  endsIn: string;
  currentBids?: number;
}

export default function AuctionCard({
  id,
  title,
  category,
  price,
  image,
  endsIn,
  currentBids,
}: AuctionCardProps) {
  const categoryTitle = getCategoriaTitle(category);

  return (
    <Link href={`/Subastas/${id}`} className="group block h-full">
      <Card className="h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-purple-300 hover:shadow-xl transition-all duration-300 bg-white">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <Badge className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 shadow-sm text-white">
            {categoryTitle}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-slate-500 mb-1">Oferta actual</p>
          <p className="text-2xl font-bold text-purple-700">${price.toLocaleString()}</p>
          {currentBids !== undefined && (
            <p className="text-xs text-slate-400 mt-1">{currentBids} puja{currentBids !== 1 ? 's' : ''}</p>
          )}
        </CardContent>
        <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex justify-between items-center">
          <span className="font-mono flex items-center gap-1">
            <span>⏱</span>
            {endsIn}
          </span>
          <span className="font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalles →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

