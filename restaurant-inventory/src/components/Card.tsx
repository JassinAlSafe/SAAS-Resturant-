import { ReactNode } from "react";
import {
  Card as ShadcnCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

const Card = ({
  title,
  children,
  className = "",
  titleClassName = "",
  contentClassName = "",
}: CardProps) => {
  return (
    <ShadcnCard
      className={cn(
        "transition-all duration-200 hover:shadow-md rounded-xl border-[1.5px]",
        className
      )}
    >
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-sm font-medium", titleClassName)}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(title ? "pt-0" : "", contentClassName)}>
        {children}
      </CardContent>
    </ShadcnCard>
  );
};

export default Card;
