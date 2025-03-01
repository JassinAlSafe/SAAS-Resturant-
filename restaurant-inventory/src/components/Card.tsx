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
        "transition-all duration-200 bg-card border-border/40 shadow-sm hover:shadow-md rounded-xl border",
        className
      )}
    >
      {title && (
        <CardHeader className="pb-3 px-6 pt-5">
          <CardTitle className={cn("text-base font-medium", titleClassName)}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent
        className={cn("px-6 pb-5", title ? "pt-0" : "pt-5", contentClassName)}
      >
        {children}
      </CardContent>
    </ShadcnCard>
  );
};

export default Card;
