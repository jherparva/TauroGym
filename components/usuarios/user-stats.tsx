import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Users, DollarSign, AlertCircle } from "lucide-react"
import { formatCOP } from "../../lib/currency"

interface UserStatsProps {
  totalUsuariosActivos: number
  totalIngresos: number
  totalPendiente: number
  usuariosConAbono: number
}

export function UserStats({ totalUsuariosActivos, totalIngresos, totalPendiente, usuariosConAbono }: UserStatsProps) {
  return (
    <div className="grid gap-6 mb-8 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{totalUsuariosActivos}</div>
          </div>
          <p className="text-xs text-muted-foreground">Total de miembros con membresía activa</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCOP(totalIngresos)}</div>
          </div>
          <p className="text-xs text-muted-foreground">Total recaudado en el período</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCOP(totalPendiente)}</div>
          </div>
          <p className="text-xs text-muted-foreground">Pagos pendientes por cobrar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pagos con Abonos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{usuariosConAbono}</div>
          </div>
          <p className="text-xs text-muted-foreground">Usuarios con abonos parciales</p>
        </CardContent>
      </Card>
    </div>
  )
}
