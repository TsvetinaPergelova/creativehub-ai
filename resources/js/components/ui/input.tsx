import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input/90 file:text-foreground placeholder:text-foreground/45 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-white/92 px-3 py-1 text-base text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[color,box-shadow,border-color,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-transparent dark:placeholder:text-muted-foreground dark:shadow-none md:text-sm",
        "focus-visible:border-primary/60 focus-visible:ring-primary/20 focus-visible:ring-[3px] dark:focus-visible:border-ring dark:focus-visible:ring-ring/50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
