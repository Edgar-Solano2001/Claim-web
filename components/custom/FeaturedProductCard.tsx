import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeaturedProductCardProps {
  imageUrl: string;
  title: string;
  description: string;
}

export default function FeaturedProductCard({
  imageUrl,
  title,
  description,
}: FeaturedProductCardProps) {
  return (
    <Card className="w-auto group hover:-translate-y-2 transition-transform duration-300 ease-out hover:shadow-lg">
      <CardHeader>
        <Image
          src={imageUrl}
          alt={title}
          width={120}
          height={100}
          className="h-60 w-full object-cover rounded-md"
        />
      </CardHeader>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1 mb-2">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full cursor-pointer">
          Ver Mas
        </Button>
      </CardFooter>
    </Card>
  );
}
