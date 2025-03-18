"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Settings, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import CategoryDropdown from "@/components/navigation/CategoryDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const userNavItems = [
    ...(session?.user?.role === "ADMIN"
      ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-darkCard/90 backdrop-blur-sm border-b border-1 border-darkBorder shadow-sm"
          : "bg-darkCard/0"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-semibold text-primary"
              >
                75Tribune
              </motion.span>
            </Link>
            <div className="hidden sm:flex sm:space-x-6">
              {["/", "/articles"].map((path) => (
                <motion.div
                  key={path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={path}
                    className={cn(
                      "text-sm font-medium text-darkText hover:text-primary transition-colors",
                      isActive(path) && "text-primary"
                    )}
                  >
                    {path === "/" ? "Accueil" : "Articles"}
                  </Link>
                </motion.div>
              ))}
              <CategoryDropdown />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session?.user ? (
              <>
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border-1 border-darkBorder">
                        <AvatarImage
                          src={
                            session.user.avatar ||
                            "/uploads/avatars/default-avatar.png"
                          }
                          alt={session.user.name || ""}
                        />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-darkCard border-1 border-darkBorder rounded-md shadow-lg"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-darkText">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted:foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-darkBorder" />
                    {userNavItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center text-darkText hover:bg-darkCard/20"
                        >
                          <item.icon className="mr-2 h-4 w-4 text-primary" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-darkBorder" />
                    <DropdownMenuItem>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-darkText border-1 border-darkBorder hover:bg-darkCard/20"
                >
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-primary text-darkText hover:bg-secondary"
                >
                  <Link href="/register">Inscription</Link>
                </Button>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden p-2 text-darkText hover:bg-darkCard/20 rounded-md"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden absolute left-4 right-4 top-16 bg-darkCard border-1 border-darkBorder rounded-md shadow-lg"
            >
              <div className="p-4 space-y-3">
                <Link
                  href="/"
                  className={cn(
                    "block text-sm text-darkText hover:text-primary",
                    isActive("/") && "text-primary"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  href="/articles"
                  className={cn(
                    "block text-sm text-darkText hover:text-primary",
                    isActive("/articles") && "text-primary"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Articles
                </Link>
                {session?.user && (
                  <div className="pt-4 pb-3 border-t border-1 border-darkBorder">
                    <div className="flex items-center px-4">
                      <Avatar className="h-8 w-8 border-1 border-darkBorder">
                        <AvatarImage
                          src={
                            session.user.avatar ||
                            "/uploads/avatars/default-avatar.png"
                          }
                          alt={session.user.name || ""}
                        />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-darkText">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted:foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-darkText hover:bg-darkCard/20"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="mr-2 h-4 w-4 text-primary" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="px-4 py-2">
                        <LogoutButton />
                      </div>
                    </div>
                  </div>
                )}
                {!session?.user && (
                  <div className="pt-4 pb-3 border-t border-1 border-darkBorder">
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-darkText hover:bg-darkCard/20"
                      onClick={() => setIsOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-sm text-darkText hover:bg-darkCard/20"
                      onClick={() => setIsOpen(false)}
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
