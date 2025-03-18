"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  FolderTree,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Articles",
    icon: FileText,
    href: "/dashboard/articles",
  },
  {
    title: "Catégories",
    icon: FolderTree,
    href: "/dashboard/categories",
  },
  {
    title: "Abonnés",
    icon: Users,
    href: "/dashboard/subscribers",
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Fermer le menu latéral sur mobile lors du changement de page
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Sauvegarder l'état du sidebar dans le localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#sidebar") && !target.closest("#sidebar-button")) {
        setSidebarOpen(false);
      }
      if (
        !target.closest("#user-menu") &&
        !target.closest("#user-menu-button")
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-lightCard dark:bg-darkCard border-b border-lightBorder dark:border-darkBorder shadow neumorphic-light dark:neumorphic">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo et bouton menu */}
          <div className="flex items-center">
            <button
              id="sidebar-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-mutedLight:foreground dark:text-muted:foreground hover:bg-lightCard/50 dark:hover:bg-darkCard/50 lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg text-mutedLight:foreground dark:text-muted:foreground hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
              title={sidebarCollapsed ? "Déplier le menu" : "Replier le menu"}
            >
              <MenuIcon size={24} />
            </button>
            <Link href="/dashboard" className="ml-3 lg:ml-0">
              <h1 className="text-xl font-bold text-primary dark:text-primary">
                {!sidebarCollapsed && <span>75Tribune</span>}
              </h1>
            </Link>
          </div>

          {/* Actions de droite */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg text-mutedLight:foreground dark:text-muted:foreground hover:bg-lightCard/50 dark:hover:bg-darkCard/50">
              <Bell size={20} />
            </button>
            <div className="relative">
              <button
                id="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-mutedLight:foreground dark:text-muted:foreground hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
              >
                <User size={20} />
                <span className="hidden sm:block text-lightText dark:text-darkText">
                  {session?.user?.name}
                </span>
                <ChevronDown size={16} />
              </button>
              {userMenuOpen && (
                <div
                  id="user-menu"
                  className="absolute right-0 mt-2 w-48 py-2 bg-lightCard dark:bg-darkCard rounded-lg shadow-lg border border-lightBorder dark:border-darkBorder neumorphic-light dark:neumorphic"
                >
                  <a
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-lightText dark:text-darkText hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
                  >
                    Profil
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-lightText dark:text-darkText hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <nav className="relative h-full px-3 py-4 overflow-y-auto bg-lightCard dark:bg-darkCard border-r border-lightBorder dark:border-darkBorder neumorphic-light dark:neumorphic">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg group transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                        : "text-mutedLight:foreground dark:text-muted:foreground hover:bg-lightCard/50 dark:hover:bg-darkCard/50"
                    }`}
                    title={sidebarCollapsed ? item.title : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                    />
                    {!sidebarCollapsed && (
                      <span className="ml-3 text-lightText dark:text-darkText">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={`min-h-screen pt-10 transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        } w-full`}
      >
        <div className="p-4 w-full">{children}</div>
      </main>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
