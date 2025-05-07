import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h3 className="mt-2 text-lg font-medium">Cargando control de asistencia...</h3>
        <p className="text-sm text-muted-foreground">Por favor espere mientras se cargan los datos de asistencia.</p>
      </div>
    </div>
  )
}
