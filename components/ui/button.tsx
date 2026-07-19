import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-hover)] active:scale-[0.98]",
        outline:
          "border border-[var(--border)] bg-white text-zinc-800 hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)] hover:text-zinc-950",
        ghost:
          "text-zinc-500 hover:bg-[var(--brand-soft)] hover:text-zinc-900",
      },
      size: {
        default: "h-12 px-6",
        icon: "size-11",
        sm: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
