"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/language-toggle"
import { UserInfo } from "@/components/user-info"
import {
  BarChart3,
  Calendar,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"


export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [cerrando, setCerrando] = useState(false)
  const { open, setOpen, isMobile } = useSidebar()

  const estaActivo = (ruta: string) => {
    return pathname === ruta
  }

  const manejarCierreSesion = async () => {
    try {
      setCerrando(true)
      const respuesta = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!respuesta.ok) {
        throw new Error("Error al cerrar sesión")
      }

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setCerrando(false)
    }
  }

  // Cerrar el sidebar en móvil cuando se navega a una nueva página
  useEffect(() => {
    if (isMobile) {
      setOpen(false)
    }
  }, [pathname, isMobile, setOpen])

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/usuarios", label: "Usuarios", icon: Users },
    { href: "/planes", label: "Planes", icon: CreditCard },
    { href: "/rutinas", label: "Rutinas", icon: Dumbbell },
    { href: "/productos", label: "Productos", icon: ShoppingBag },
    { href: "/asistencia", label: "Asistencia", icon: Calendar },
    { href: "/reportes", label: "Reportes", icon: BarChart3 },
    { href: "/soporte", label: "Soporte", icon: LifeBuoy },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ]

  const renderNavigation = () => (
    <nav className="space-y-2 px-2">
      {navigationItems.map((item) => (
        <Link href={item.href} key={item.href}>
          <Button variant={estaActivo(item.href) ? "default" : "ghost"} className="w-full justify-start gap-2">
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Button>
        </Link>
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-destructive"
        onClick={manejarCierreSesion}
        disabled={cerrando}
      >
        <LogOut className="h-4 w-4" />
        <span>{cerrando ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
      </Button>
    </nav>
  )

  // Versión móvil con Sheet
  if (isMobile) {
    return (
      <>
        <div className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-bold">Tauro Gym</span>
          </div>
          <div className="ml-auto">
            <LanguageToggle />
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle asChild>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <span className="font-bold">Tauro Gym</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar menú</span>
                  </Button>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="px-4 py-4">
              <UserInfo />
            </div>
            {renderNavigation()}
          </SheetContent>
        </Sheet>
      </>
    )
  }


  // Versión desktop
  return (
    <aside className={cn("hidden border-r bg-background/50 backdrop-blur md:block", open ? "w-[280px]" : "w-[80px]")}>
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Dumbbell className="h-6 w-6 text-primary" />
        {open && <span className="font-bold">Tauro Gym</span>}
        <div className={cn("ml-auto", !open && "hidden")}>
          <LanguageToggle />
        </div>
      </div>
      <div className={cn("px-4 py-4", !open && "flex justify-center")}>
        <UserInfo collapsed={!open} />
      </div>
      <nav className="space-y-2 px-2">
        {navigationItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <Button
              variant={estaActivo(item.href) ? "default" : "ghost"}
              className={cn("w-full justify-start gap-2", !open && "justify-center px-0")}
              title={!open ? item.label : undefined}
            >
              <item.icon className="h-4 w-4" />
              {open && <span>{item.label}</span>}
            </Button>
          </Link>
        ))}
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-2 text-destructive", !open && "justify-center px-0")}
          onClick={manejarCierreSesion}
          disabled={cerrando}
          title={!open ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {open && <span>{cerrando ? "Cerrando sesión..." : "Cerrar Sesión"}</span>}
        </Button>
      </nav>
    </aside>
  )
}
