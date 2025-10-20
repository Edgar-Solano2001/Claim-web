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
    <Card className="rounded-2xl transition-all duration-300 cursor-pointer hover:scale-105">
      <CardContent>
        <Image
          src={imageUrl}
          alt={title}
          width={160}
          height={200}
          className="rounded-md border w-64 h-64"
        />

        <h3 className="text-base sm:text-lg font-semibold">
            {title}
        </h3>

        <p className="text-sm text-gray-600 text-center mt-2 line-clamp-2">
            {description}
        </p>

        <Button variant="outline" className="mt-4">
            Ver Mas
        </Button>


      </CardContent>
    </Card>
  );
};
