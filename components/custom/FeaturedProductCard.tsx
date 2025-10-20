import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeaturedProductCardProps {
    imageUrl: string;
    title: string;
    description: string;
}

export default function FeaturedProductCard({
    imageUrl,
    title,
    description
}: FeaturedProductCardProps) 

{
  return (
    <Card className="rounded-2xl group hover:-translate-y-2 transition-transform duration-300 ease-out hover:shadow-lg">
      <CardContent className="flex flex-col gap-4 items-center text-center sm:items-start sm:text-left">
        <div className="relative w-full h-80 sm:h-64 md:h-80 lg:h-80 rounded-md overflow-hidden border">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        <h3 className="text-sm sm:text-base md:text-lg font-semibold">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mt-2 line-clamp-3 sm:line-clamp-2">
          {description}
        </p>

        <Button variant="outline" className="mt-4 w-full sm:w-auto">
          Ver Más
        </Button>
      </CardContent>
    </Card>
  );
};
