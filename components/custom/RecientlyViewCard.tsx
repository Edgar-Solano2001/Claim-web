import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RecientlyViewCardProps{
    imageUrl: string;
    title: string;
    description: string;
}

export default function RecientlyViewCard({imageUrl, title, description}: RecientlyViewCardProps) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex">
            <Image
              src={imageUrl}
              alt={title}
              width={100}
              height={140}
              className="rounded-md border border-purple-400/40"
            />
          </div>

          <div className="flex flex-col items-start text-left flex-1">
            <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
            <p className="text-sm text-gray-300 mt-2">{description}</p>
            <Button variant="outline" className="mt-4 border-black">
              Ver Mas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
};
