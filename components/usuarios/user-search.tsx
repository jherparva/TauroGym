"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Search, FilterX } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UserSearchProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  mesActual: Date
  cambiarMes: (direccion: "anterior" | "siguiente") => void
  restablecerFiltros: () => void
}

export function UserSearch({
  searchQuery,
  setSearchQuery,
  mesActual,
  cambiarMes,
  restablecerFiltros,
}: UserSearchProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Buscar Miembros</CardTitle>
        <CardDescription>Encuentre miembros por nombre, cédula o estado de membresía</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar miembros... (búsqueda automática)"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Button variant="outline" size="sm" onClick={() => cambiarMes("anterior")}>
              &lt;
            </Button>
            <span className="mx-2 min-w-32 text-center">{format(mesActual, "MMMM yyyy", { locale: es })}</span>
            <Button variant="outline" size="sm" onClick={() => cambiarMes("siguiente")}>
              &gt;
            </Button>
            <Button variant="ghost" size="sm" onClick={restablecerFiltros} title="Restablecer filtros">
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
