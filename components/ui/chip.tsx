import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
    "inline-flex items-center rounded-full border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                default: "border-border bg-card text-card-foreground hover:bg-muted",
                selected: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                outline: "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            },
            size: {
                default: "h-8 px-3 py-1",
                sm: "h-6 px-2 py-0.5 text-xs",
                lg: "h-10 px-4 py-2",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ChipProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof chipVariants> {
    selected?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
    ({ className, variant, size, selected, ...props }, ref) => {
        return (
            <button
                className={cn(
                    chipVariants({
                        variant: selected ? "selected" : variant,
                        size,
                        className
                    })
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Chip.displayName = "Chip";

export { Chip, chipVariants };