
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { Route as RouteIcon } from "lucide-react";

interface RouteFeaturedImageProps {
  imageUrl?: string;
  altText: string;
  className?: string;
  height?: string;
}

const RouteFeaturedImage = ({
  imageUrl,
  altText,
  className,
  height = "h-32"
}: RouteFeaturedImageProps) => {
  if (!imageUrl) {
    return (
      <div className={cn(
        "bg-muted flex items-center justify-center rounded-md overflow-hidden",
        height,
        className
      )}>
        <RouteIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-md overflow-hidden", height, className)}>
      <AspectRatio ratio={16/9}>
        <img 
          src={imageUrl} 
          alt={altText} 
          className="w-full h-full object-cover rounded-md"
        />
      </AspectRatio>
    </div>
  );
};

export default RouteFeaturedImage;
