import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border-0 bg-gradient-to-br from-accent/10 to-accent/30 text-card-foreground shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all duration-200",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Modern card variants

const CardWithAccent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { accentColor?: string }
>(({ className, accentColor = "primary", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl bg-gradient-to-br from-accent/10 to-accent/30 text-card-foreground shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all duration-200 overflow-hidden border-0",
      className
    )}
    {...props}
  >
    <div className={cn(
      "absolute top-0 left-0 right-0 h-1",
      {
        "bg-gradient-to-r from-primary to-primary/80": accentColor === "primary",
        "bg-gradient-to-r from-secondary to-secondary/80": accentColor === "secondary",
        "bg-gradient-to-r from-success to-success/80": accentColor === "success",
        "bg-gradient-to-r from-warning to-warning/80": accentColor === "warning",
        "bg-gradient-to-r from-info to-info/80": accentColor === "info",
        "bg-gradient-to-r from-error to-error/80": accentColor === "error",
      }
    )} />
    {props.children}
  </div>
))
CardWithAccent.displayName = "CardWithAccent"

const CardIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { color?: string }
>(({ className, color = "primary", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center rounded-lg p-3",
      {
        "text-primary bg-primary/10": color === "primary",
        "text-success bg-success/10": color === "success",
        "text-warning bg-warning/10": color === "warning",
        "text-info bg-info/10": color === "info",
        "text-error bg-error/10": color === "error",
      },
      className
    )}
    {...props}
  />
))
CardIcon.displayName = "CardIcon"

const CardGlass = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl bg-gradient-to-br from-accent/10 to-accent/20 backdrop-blur-lg border-0 text-card-foreground shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-200",
      className
    )}
    {...props}
  />
))
CardGlass.displayName = "CardGlass"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardWithAccent, 
  CardIcon,
  CardGlass 
}
