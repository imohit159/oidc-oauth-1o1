"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  return (
    <header className="w-full py-6">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Brand Logo */}
        <Link href="#" className="flex items-center gap-3 no-underline group">
          <div className="w-[42px] h-[42px] bg-[url('/logo-bg-removebg-preview.png')] bg-no-repeat bg-center bg-contain flex items-center justify-center">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px] fill-background mb-[2px]">
              <path d="M 10 20 Q 50 25 90 20 L 88 28 Q 50 32 12 28 Z" />
              <rect x="18" y="38" width="64" height="6" />
              <path d="M 33 30 L 26 80 L 32 80 L 38 30 Z" />
              <path d="M 67 30 L 74 80 L 68 80 L 62 30 Z" />
              <rect x="47" y="30" width="6" height="8" />
            </svg>
          </div>
          <div className="font-serif font-bold text-xl tracking-[4px] text-primary transition-colors">
            Zen
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="#"
            className="text-foreground hover:text-primary font-normal text-[0.8rem] transition-colors relative after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-accent hover:after:w-full after:transition-all after:duration-200"
          >
            Docs
          </Link>
          <Link
            href="#"
            className="text-foreground hover:text-primary font-normal text-[0.8rem] transition-colors relative after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-accent hover:after:w-full after:transition-all after:duration-200"
          >
            About
          </Link>
          <Link href="#" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors" aria-label="GitHub">
            <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current transition-colors">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </Link>
        </nav>

        {/* Mobile Navigation Drawer */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open Menu">
                  <Menu className="w-5 h-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[280px] p-6 bg-background flex flex-col justify-between">
              <div className="flex flex-col gap-8 mt-8">
                <Link href="#" className="flex items-center gap-3 group">
                  <div className="w-[42px] h-[42px] bg-[url('/logo-bg-removebg-preview.png')] bg-no-repeat bg-center bg-contain flex items-center justify-center">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px] fill-background mb-[2px]">
                      <path d="M 10 20 Q 50 25 90 20 L 88 28 Q 50 32 12 28 Z" />
                      <rect x="18" y="38" width="64" height="6" />
                      <path d="M 33 30 L 26 80 L 32 80 L 38 30 Z" />
                      <path d="M 67 30 L 74 80 L 68 80 L 62 30 Z" />
                      <rect x="47" y="30" width="6" height="8" />
                    </svg>
                  </div>
                  <span className="font-serif font-bold text-xl tracking-[4px] text-primary">Zen</span>
                </Link>
                <div className="flex flex-col gap-5 pl-2">
                  <Link href="#" className="text-foreground hover:text-primary font-medium text-base transition-colors">
                    Docs
                  </Link>
                  <Link href="#" className="text-foreground hover:text-primary font-medium text-base transition-colors">
                    About
                  </Link>
                </div>
              </div>
              <div>
                <Link href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm pl-2">
                  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  <span>GitHub Repository</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
