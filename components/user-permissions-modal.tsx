"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { toast } from "./ui/use-toast"
import { Loader2, Save, Trash2, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent } from "./ui/card"

interface User {
  id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
}

interface Role {
  id: string
  nombre: string
  permisos: string[]
}

interface Permission {
  id: string
  nombre: string
  descripcion?: string
}

export function UserPermissionsModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState("usuarios")

  // Estado para usuarios y roles
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])

  // Estado para nuevo usuario
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "",
  })

  // Estado para edición de rol
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      setSelectedPermissions(role.permisos)
    } else {
      setSelectedPermissions([])
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const handleAddUser = async () => {
    if (!newUser.nombre || !newUser.email || !newUser.password || !newUser.rol) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Cambiar la ruta a /api/users que es la que tenemos implementada
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        throw new Error("Error al crear usuario")
      }

      const data = await response.json()

      // Actualizar la lista de usuarios
      setUsers((prev) => [...prev, data.user])

      // Limpiar el formulario
      setNewUser({
        nombre: "",
        email: "",
        password: "",
        rol: "",
      })

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      })
    } catch (error) {
      console.error("Error al crear usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/roles/${selectedRole}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permisos: selectedPermissions }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar permisos")
      }

      // Actualizar roles en el estado
      setRoles((prev) =>
        prev.map((role) => {
          if (role.id === selectedRole) {
            return { ...role, permisos: selectedPermissions }
          }
          return role
        }),
      )

      toast({
        title: "Permisos actualizados",
        description: "Los permisos del rol han sido actualizados correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar permisos:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar usuario")
      }

      // Actualizar la lista de usuarios
      setUsers((prev) => prev.filter((user) => user.id !== userId))

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      // Cargar usuarios
      const usersResponse = await fetch("/api/usuarios")
      if (!usersResponse.ok) throw new Error("Error al cargar usuarios")
      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])

      // Cargar roles
      const rolesResponse = await fetch("/api/roles")
      if (!rolesResponse.ok) throw new Error("Error al cargar roles")
      const rolesData = await rolesResponse.json()
      setRoles(rolesData.roles || [])

      // Cargar permisos disponibles
      const permissionsResponse = await fetch("/api/permissions")
      if (!permissionsResponse.ok) throw new Error("Error al cargar permisos")
      const permissionsData = await permissionsResponse.json()
      setAvailablePermissions(permissionsData.permissions || [])
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  // Cargar datos al abrir el modal
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      loadData()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Gestionar Usuarios
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usuarios y Permisos</DialogTitle>
          <DialogDescription>Administre los usuarios del sistema, sus roles y permisos de acceso.</DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Cargando datos...</p>
          </div>
        ) : (
          <Tabs defaultValue="usuarios" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
              <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Agregar nuevo usuario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          value={newUser.nombre}
                          onChange={handleInputChange}
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={newUser.email}
                          onChange={handleInputChange}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={newUser.password}
                          onChange={handleInputChange}
                          placeholder="Contraseña"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                        <Select
                          value={newUser.rol}
                          onValueChange={(value) => setNewUser((prev) => ({ ...prev, rol: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddUser} className="mt-2" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Agregar usuario
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Usuarios del sistema</h3>
                  {users.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No hay usuarios registrados</p>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-4 py-3">
                              Nombre
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Correo
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Rol
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Estado
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                              <td className="px-4 py-3">{user.nombre}</td>
                              <td className="px-4 py-3">{user.email}</td>
                              <td className="px-4 py-3">{roles.find((r) => r.id === user.rol)?.nombre || user.rol}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${user.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {user.activo ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="h-8 w-8 p-0 text-red-500"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Roles</h3>
                  {roles.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No hay roles disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <Button
                          key={role.id}
                          variant={selectedRole === role.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleRoleSelect(role.id)}
                        >
                          {role.nombre}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Permisos</h3>
                  {selectedRole ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Seleccione los permisos para el rol:{" "}
                        <strong>{roles.find((r) => r.id === selectedRole)?.nombre}</strong>
                      </p>

                      {availablePermissions.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">No hay permisos disponibles</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availablePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`perm-${permission.id}`}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <Label htmlFor={`perm-${permission.id}`}>{permission.nombre}</Label>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button onClick={handleSaveRolePermissions} disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar permisos
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Seleccione un rol para ver y editar sus permisos</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
