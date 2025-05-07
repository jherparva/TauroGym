import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Bell, Settings, Users, Calendar } from "lucide-react"
import { WhatsAppModal } from "@/components/pagos/whatsapp-modal"
import { WhatsAppBatchNotification } from "@/components/pagos/whatsapp-batch-notification"
import { SystemNotificationsModal } from "@/components/system-notifications-modal"
import { UserPermissionsModal } from "@/components/user-permissions-modal"
import { TaskSchedulingModal } from "@/components/task-scheduling-modal"
import { GeneralConfigModal } from "@/components/general-config-modal"

export default function ConfiguracionPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-muted-foreground mb-8">Administre la configuración del sistema</p>

      <div className="flex flex-wrap gap-4 mb-8">
        <WhatsAppModal />
        <WhatsAppBatchNotification />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Notificaciones WhatsApp
            </CardTitle>
            <CardDescription>Configure las notificaciones automáticas por WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Configure las notificaciones automáticas para alertar a los miembros cuando sus planes estén por vencer.
            </p>
          </CardContent>
          <CardFooter>
            <WhatsAppModal />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notificaciones del Sistema
            </CardTitle>
            <CardDescription>Configure las notificaciones internas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Administre las notificaciones internas del sistema y las alertas para los administradores.
            </p>
          </CardContent>
          <CardFooter>
            <SystemNotificationsModal />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Usuarios y Permisos
            </CardTitle>
            <CardDescription>Administre los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Configure los usuarios administradores, sus roles y permisos de acceso al sistema.
            </p>
          </CardContent>
          <CardFooter>
            <UserPermissionsModal />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Programación de Tareas
            </CardTitle>
            <CardDescription>Configure tareas automáticas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Programe tareas automáticas como notificaciones, respaldos y mantenimiento del sistema.
            </p>
          </CardContent>
          <CardFooter>
            <TaskSchedulingModal />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-500" />
              Configuración General
            </CardTitle>
            <CardDescription>Ajustes generales del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Configure los parámetros generales del sistema, como nombre del gimnasio, logo y preferencias.
            </p>
          </CardContent>
          <CardFooter>
            <GeneralConfigModal />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
