"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Avatar } from "../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { DatePickerWithRange } from "../../components/date-range-picker"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Calendar } from "../../components/ui/calendar"
import {
  Check,
  Search,
  LogOut,
  Loader2,
  CalendarIcon,
  X,
  Filter,
  History,
  RefreshCcw,
  UserPlus,
  Pencil,
  Trash,
  Eye,
  Download,
  BarChart2,
  Users,
  Clock,
  QrCode,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { formatDateTime, cn } from "../../lib/utils"
import { toast } from "../../components/ui/use-toast"
import { UserDetailModal } from "../../components/user-detail-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday } from "date-fns"
import { es } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface User {
  _id: string
  cedula: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  fechaNacimiento?: Date
  estado: "activo" | "inactivo"
  plan?: {
    _id: string
    nombre: string
    descripcion: string
    precio: number
    duracion: number
    beneficios: string[]
    estado: "activo" | "inactivo"
  }
  fechaInicio?: string
  fechaFin?: string
  montoPagado: number
  createdAt?: string
  updatedAt?: string
}

interface Attendance {
  _id: string
  usuario: string | User
  fecha: string
  horaEntrada: string
  horaSalida?: string
  observaciones?: string
  asistio?: boolean // Nuevo campo para control manual
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function AttendancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")

  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAttendedOnly, setShowAttendedOnly] = useState(false)
  const [viewAllDates, setViewAllDates] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkinUserId, setCheckinUserId] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutUserId, setCheckoutUserId] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("registro")
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [isExporting, setIsExporting] = useState(false)
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [isBatchCheckingIn, setIsBatchCheckingIn] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [statsTimeframe, setStatsTimeframe] = useState("week")
  const [statsData, setStatsData] = useState<any[]>([])
  const [userAttendanceStats, setUserAttendanceStats] = useState<any[]>([])
  const [hourlyStats, setHourlyStats] = useState<any[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isManualAttendanceOpen, setIsManualAttendanceOpen] = useState(false)
  const [manualAttendanceDate, setManualAttendanceDate] = useState(new Date().toISOString().split("T")[0])
  const [manualAttendanceRecords, setManualAttendanceRecords] = useState<{ [key: string]: boolean }>({})

  // Estados para editar asistencia
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null)
  const [editFormData, setEditFormData] = useState({
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    observaciones: "",
    asistio: true,
  })

  // Filtrado de usuarios para el selector de entrada
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users

    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) => user.nombre.toLowerCase().includes(query) || user.cedula?.toLowerCase().includes(query),
    )
  }, [users, searchQuery])

  // Filtrado de registros de asistencia
  const filteredAttendance = useMemo(() => {
    if (!searchQuery && !showAttendedOnly && !dateRange.from && !dateRange.to) return attendance

    return attendance.filter((record) => {
      const user = record.usuario && typeof record.usuario === "object" ? record.usuario : getUserById(record.usuario)

      const matchesSearch =
        !searchQuery ||
        (user &&
          (user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.cedula && user.cedula.toLowerCase().includes(searchQuery.toLowerCase()))))

      const matchesFilter = !showAttendedOnly || !record.horaSalida

      // Filtro por rango de fechas
      let matchesDateRange = true
      if (dateRange.from || dateRange.to) {
        const recordDate = new Date(record.fecha)
        if (dateRange.from && dateRange.to) {
          matchesDateRange = recordDate >= dateRange.from && recordDate <= dateRange.to
        } else if (dateRange.from) {
          matchesDateRange = recordDate >= dateRange.from
        } else if (dateRange.to) {
          matchesDateRange = recordDate <= dateRange.to
        }
      }

      return matchesSearch && matchesFilter && matchesDateRange
    })
  }, [attendance, searchQuery, showAttendedOnly, dateRange])

  // Estadísticas de asistencia por día
  const generateStatsData = () => {
    let startDate, endDate
    const now = new Date()

    if (statsTimeframe === "week") {
      startDate = startOfWeek(now, { weekStartsOn: 1 }) // Lunes
      endDate = endOfWeek(now, { weekStartsOn: 1 }) // Domingo
    } else if (statsTimeframe === "month") {
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    } else {
      // Últimos 30 días
      startDate = addDays(now, -30)
      endDate = now
    }

    // Crear un mapa de fechas para el período seleccionado
    const dateMap = new Map()
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      dateMap.set(dateStr, {
        date: format(currentDate, "dd/MM", { locale: es }),
        total: 0,
        isToday: isToday(currentDate),
      })
      currentDate = addDays(currentDate, 1)
    }

    // Contar asistencias por fecha
    attendance.forEach((record) => {
      const recordDate = format(new Date(record.fecha), "yyyy-MM-dd")
      if (dateMap.has(recordDate)) {
        const data = dateMap.get(recordDate)
        data.total += 1
        dateMap.set(recordDate, data)
      }
    })

    // Convertir el mapa a un array para el gráfico
    return Array.from(dateMap.values())
  }

  // Estadísticas de asistencia por usuario
  const generateUserStats = () => {
    const userMap = new Map()

    // Contar asistencias por usuario
    attendance.forEach((record) => {
      const user =
        record.usuario && typeof record.usuario === "object" ? record.usuario : getUserById(record.usuario as string)

      if (user) {
        const userId = user._id
        const userName = user.nombre

        if (userMap.has(userId)) {
          userMap.get(userId).count += 1
        } else {
          userMap.set(userId, {
            name: userName,
            count: 1,
            id: userId,
          })
        }
      }
    })

    // Ordenar por número de asistencias (descendente)
    return Array.from(userMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 usuarios
  }

  // Estadísticas por hora del día
  const generateHourlyStats = () => {
    const hourMap = new Map()

    // Inicializar horas
    for (let i = 6; i < 23; i++) {
      hourMap.set(i, { hour: `${i}:00`, count: 0 })
    }

    // Contar entradas por hora
    attendance.forEach((record) => {
      const entryTime = new Date(record.horaEntrada)
      const hour = entryTime.getHours()

      if (hourMap.has(hour)) {
        const data = hourMap.get(hour)
        data.count += 1
        hourMap.set(hour, data)
      }
    })

    return Array.from(hourMap.values())
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch active users
        const usersResponse = await fetch("/api/usuarios?estado=activo")
        const usersData = await usersResponse.json()
        setUsers(usersData.users)

        // Fetch attendance for the selected date or for specific user if userId is provided
        if (userId) {
          const attendanceResponse = await fetch(`/api/asistencia?usuario=${userId}`)
          const attendanceData = await attendanceResponse.json()
          setAttendance(attendanceData.asistencias)
          setViewAllDates(true)
          setActiveTab("historial")

          // Buscar y seleccionar el usuario
          const user = usersData.users.find((u: User) => u._id === userId)
          if (user) {
            setSelectedUser(user)
            setSelectedUserId(user._id)
          }
        } else {
          await fetchAttendance()
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Intente nuevamente.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Establecemos la fecha actual en el selector
    const today = new Date().toISOString().split("T")[0]
    setDate(today)
    setManualAttendanceDate(today)
  }, [userId])

  // Actualizar estadísticas cuando cambia la asistencia
  useEffect(() => {
    if (attendance.length > 0) {
      setStatsData(generateStatsData())
      setUserAttendanceStats(generateUserStats())
      setHourlyStats(generateHourlyStats())
    }
  }, [attendance, statsTimeframe])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      // Si viewAllDates es true, no enviamos parámetro de fecha para obtener todos los registros
      const endpoint = viewAllDates ? "/api/asistencia" : `/api/asistencia?fecha=${date}`

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error("Error al cargar asistencias")
      const data = await response.json()
      setAttendance(data.asistencias)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de asistencia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setDate(newDate)
    // Solo actualizamos si no estamos en modo "todas las fechas"
    if (!viewAllDates) {
      try {
        setLoading(true)
        const response = await fetch(`/api/asistencia?fecha=${newDate}`)
        if (!response.ok) throw new Error("Error al cargar asistencias")
        const data = await response.json()
        setAttendance(data.asistencias)

        // Limpiar selección actual cuando cambiamos de fecha
        setSelectedUserId("")
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros para esta fecha",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd")
      setDate(formattedDate)
      setSelectedDate(date)
      setIsCalendarOpen(false)

      // Cargar asistencias para la fecha seleccionada
      if (!viewAllDates) {
        fetchAttendanceForDate(formattedDate)
      }
    }
  }

  const fetchAttendanceForDate = async (dateStr: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/asistencia?fecha=${dateStr}`)
      if (!response.ok) throw new Error("Error al cargar asistencias")
      const data = await response.json()
      setAttendance(data.asistencias)
      setSelectedUserId("")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros para esta fecha",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleViewMode = async () => {
    const newViewMode = !viewAllDates
    setViewAllDates(newViewMode)

    try {
      setLoading(true)
      const endpoint = newViewMode ? "/api/asistencia" : `/api/asistencia?fecha=${date}`
      const response = await fetch(endpoint)

      if (!response.ok) throw new Error("Error al cargar asistencias")
      const data = await response.json()
      setAttendance(data.asistencias)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de asistencia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (userId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Seleccione un usuario para registrar",
        variant: "destructive",
      })
      return
    }

    setIsCheckingIn(true)
    setCheckinUserId(userId)

    try {
      // Usamos la fecha seleccionada en el selector de fecha
      const selectedDate = new Date(date)
      // Establecemos la hora actual para la entrada
      const currentTime = new Date()

      // Creamos una fecha que combine la fecha seleccionada con la hora actual
      const entryDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds(),
      )

      const response = await fetch("/api/asistencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: userId,
          fecha: selectedDate,
          horaEntrada: entryDateTime,
          asistio: true, // Por defecto, si registra entrada, asistió
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al registrar entrada")
      }

      // Actualizar lista de asistencias
      await fetchAttendance()

      toast({
        title: "¡Éxito!",
        description: "Entrada registrada correctamente",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCheckingIn(false)
      setCheckinUserId("")
      setSelectedUserId("")
    }
  }

  const handleBatchCheckIn = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione al menos un usuario para registrar",
        variant: "destructive",
      })
      return
    }

    setIsBatchCheckingIn(true)

    try {
      // Usamos la fecha seleccionada en el selector de fecha
      const selectedDate = new Date(date)
      // Establecemos la hora actual para la entrada
      const currentTime = new Date()

      // Creamos una fecha que combine la fecha seleccionada con la hora actual
      const entryDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds(),
      )

      // Registrar entrada para cada usuario seleccionado
      const promises = selectedUserIds.map((userId) =>
        fetch("/api/asistencia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario: userId,
            fecha: selectedDate,
            horaEntrada: entryDateTime,
            asistio: true,
          }),
        }),
      )

      const results = await Promise.allSettled(promises)
      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failCount = results.length - successCount

      // Actualizar lista de asistencias
      await fetchAttendance()

      toast({
        title: "Registro masivo completado",
        description: `${successCount} entradas registradas correctamente. ${failCount} fallidas.`,
        variant: failCount > 0 ? "destructive" : "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al registrar entradas masivas",
        variant: "destructive",
      })
    } finally {
      setIsBatchCheckingIn(false)
      setSelectedUserIds([])
    }
  }

  const handleCheckOut = async (id: string) => {
    setCheckoutUserId(id)
    setIsCheckingOut(true)

    try {
      // Usamos la fecha seleccionada en el selector de fecha
      const selectedDate = new Date(date)
      // Establecemos la hora actual para la salida
      const currentTime = new Date()

      // Creamos una fecha que combine la fecha seleccionada con la hora actual
      const exitDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds(),
      )

      const response = await fetch(`/api/asistencia/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          horaSalida: exitDateTime,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al registrar salida")
      }

      // Fetch updated attendance
      await fetchAttendance()

      toast({
        title: "¡Éxito!",
        description: "Salida registrada correctamente",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error:", error.message)
      toast({
        title: "Error",
        description: "No se pudo registrar la salida",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
      setCheckoutUserId("")
    }
  }

  const handleEditAttendance = (attendance: Attendance) => {
    setCurrentAttendance(attendance)

    // Formatear fechas para el formulario
    const fecha = new Date(attendance.fecha).toISOString().split("T")[0]
    const horaEntrada = new Date(attendance.horaEntrada).toISOString().slice(0, 16)
    const horaSalida = attendance.horaSalida ? new Date(attendance.horaSalida).toISOString().slice(0, 16) : ""

    setEditFormData({
      fecha,
      horaEntrada,
      horaSalida,
      observaciones: attendance.observaciones || "",
      asistio: attendance.asistio !== false, // Si no está explícitamente marcado como false, asumimos true
    })

    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!currentAttendance) return

    try {
      const response = await fetch(`/api/asistencia/${currentAttendance._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha: new Date(editFormData.fecha),
          horaEntrada: new Date(editFormData.horaEntrada),
          horaSalida: editFormData.horaSalida ? new Date(editFormData.horaSalida) : undefined,
          observaciones: editFormData.observaciones,
          asistio: editFormData.asistio,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar asistencia")
      }

      // Actualizar lista de asistencias
      await fetchAttendance()

      toast({
        title: "¡Éxito!",
        description: "Asistencia actualizada correctamente",
        variant: "default",
      })

      setIsEditModalOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar asistencia",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este registro de asistencia?")) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/asistencia/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar asistencia")
      }

      // Actualizar lista de asistencias
      await fetchAttendance()

      toast({
        title: "¡Éxito!",
        description: "Asistencia eliminada correctamente",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar asistencia",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportData = () => {
    setIsExporting(true)

    try {
      // Preparar los datos para exportar
      const dataToExport = filteredAttendance.map((record) => {
        const user =
          record.usuario && typeof record.usuario === "object" ? record.usuario : getUserById(record.usuario as string)

        return {
          Nombre: user?.nombre || "Usuario Desconocido",
          Cédula: user?.cedula || "-",
          Fecha: new Date(record.fecha).toLocaleDateString("es-ES"),
          "Hora de Entrada": new Date(record.horaEntrada).toLocaleTimeString("es-ES"),
          "Hora de Salida": record.horaSalida ? new Date(record.horaSalida).toLocaleTimeString("es-ES") : "-",
          Estado: record.horaSalida ? "Completado" : "En Gimnasio",
          Asistió: record.asistio === false ? "No" : "Sí",
          Observaciones: record.observaciones || "-",
        }
      })

      // Convertir a CSV
      const headers = Object.keys(dataToExport[0] || {}).join(",")
      const rows = dataToExport.map((row) =>
        Object.values(row)
          .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : value))
          .join(","),
      )
      const csv = [headers, ...rows].join("\n")

      // Crear un blob y descargar
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `asistencia_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación completada",
        description: "Los datos han sido exportados correctamente",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al exportar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleQrScan = (code: string) => {
    // Simulación de escaneo de QR
    setScannedCode(code)

    // Buscar usuario por código (en este caso, asumimos que el código es la cédula)
    const user = users.find((u) => u.cedula === code)

    if (user) {
      setSelectedUserId(user._id)
      handleCheckIn(user._id)
      setIsQrScannerOpen(false)

      toast({
        title: "Usuario identificado",
        description: `Se ha registrado la entrada de ${user.nombre}`,
        variant: "default",
      })
    } else {
      toast({
        title: "Error",
        description: "No se encontró ningún usuario con ese código",
        variant: "destructive",
      })
    }
  }

  // Función para manejar el control manual de asistencia
  const handleManualAttendanceChange = (userId: string, attended: boolean) => {
    setManualAttendanceRecords({
      ...manualAttendanceRecords,
      [userId]: attended,
    })
  }

  // Función para guardar los registros de asistencia manual
  const handleSaveManualAttendance = async () => {
    try {
      setLoading(true)

      // Crear un array de promesas para todas las actualizaciones
      const promises = Object.entries(manualAttendanceRecords).map(([userId, attended]) => {
        // Verificar si ya existe un registro para este usuario en esta fecha
        const existingRecord = attendance.find((record) => {
          if (!record.usuario) return false

          const recordUserId = typeof record.usuario === "object" ? record.usuario._id : record.usuario

          return recordUserId === userId && new Date(record.fecha).toISOString().split("T")[0] === manualAttendanceDate
        })

        if (existingRecord) {
          // Actualizar registro existente
          return fetch(`/api/asistencia/${existingRecord._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              asistio: attended,
            }),
          })
        } else {
          // Crear nuevo registro
          const selectedDate = new Date(manualAttendanceDate)
          const entryTime = new Date(selectedDate)
          entryTime.setHours(8, 0, 0) // Hora predeterminada: 8:00 AM

          return fetch("/api/asistencia", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario: userId,
              fecha: selectedDate,
              horaEntrada: entryTime,
              asistio: attended,
              observaciones: attended ? "Asistencia registrada manualmente" : "Inasistencia registrada manualmente",
            }),
          })
        }
      })

      // Ejecutar todas las promesas
      const results = await Promise.allSettled(promises)
      const successCount = results.filter((result) => result.status === "fulfilled").length
      const failCount = results.length - successCount

      // Actualizar lista de asistencias
      await fetchAttendance()

      toast({
        title: "Registro manual completado",
        description: `${successCount} registros guardados correctamente. ${failCount} fallidos.`,
        variant: failCount > 0 ? "destructive" : "default",
      })

      setIsManualAttendanceOpen(false)
      setManualAttendanceRecords({})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar los registros manuales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getUserById = (id: string) => {
    return users.find((user) => user._id === id)
  }

  const openUserDetail = async (userId: string) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setSelectedUser(userData.user)
        setIsUserModalOpen(true)
      }
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error)
    }
  }

  // Verifica si un usuario ya tiene registro de asistencia para la fecha seleccionada
  const hasAttendanceRecord = (userId: string) => {
    // Convertimos la fecha seleccionada en el calendario a formato comparable
    const selectedDateStr = new Date(date).toDateString()

    return attendance.some((record) => {
      // Verificar si es la fecha seleccionada
      const recordDate = new Date(record.fecha).toDateString()
      if (recordDate !== selectedDateStr) return false

      // Verificar si es el mismo usuario
      return record.usuario?._id === userId || record.usuario === userId
    })
  }

  // Colores para gráficos
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground">Registre y gestione la asistencia de los miembros al gimnasio</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {selectedUser && (
            <Badge variant="outline" className="px-3 py-1 mr-2">
              <Users className="h-3 w-3 mr-1" />
              Viendo asistencia de: {selectedUser.nombre}
            </Badge>
          )}

          <Button
            variant={viewAllDates ? "default" : "outline"}
            size="sm"
            className="mr-2"
            onClick={handleToggleViewMode}
          >
            {viewAllDates ? <CalendarIcon className="h-4 w-4 mr-2" /> : <History className="h-4 w-4 mr-2" />}
            {viewAllDates ? "Ver día actual" : "Ver historial completo"}
          </Button>

          {!viewAllDates && (
            <div className="flex items-center gap-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={selectedDate} onSelect={handleCalendarDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="registro">Registro</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="manual">Control Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="registro" className="mt-4">
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas {viewAllDates ? "Globales" : "del Día"}</CardTitle>
                <CardDescription>
                  {viewAllDates
                    ? "Resumen histórico de asistencias"
                    : `Resumen del día ${new Date(date).toLocaleDateString("es-ES")}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Total Registros</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          {attendance.length} <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Presentes Ahora</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          {attendance.filter((a) => !a.horaSalida).length} <Check className="h-5 w-5 text-green-500" />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Hora Pico</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          {hourlyStats.length > 0
                            ? hourlyStats.reduce(
                                (max, current) => (current.count > max.count ? current : max),
                                hourlyStats[0],
                              ).hour
                            : "N/A"}
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Usuarios Activos</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          {users.filter((u) => u.estado === "activo").length}{" "}
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Registro de Asistencia</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsQrScannerOpen(true)}>
                    <QrCode className="h-4 w-4" />
                    Escanear QR
                  </Button>
                  <Button
                    variant={showAttendedOnly ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setShowAttendedOnly(!showAttendedOnly)}
                  >
                    <Filter className="h-4 w-4" />
                    {showAttendedOnly ? "Todos" : "Solo Presentes"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => fetchAttendance()}>
                    <RefreshCcw className="h-4 w-4" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border rounded-md bg-muted/30">
                <h3 className="text-base font-medium mb-3">
                  Registrar Nueva Entrada para {new Date(date).toLocaleDateString("es-ES")}
                </h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar miembro por nombre o cédula..."
                        className="pl-8 mb-3 md:mb-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="absolute right-2.5 top-2.5" onClick={() => setSearchQuery("")}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-grow gap-3">
                    <Select value={selectedUserId} onValueChange={setSelectedUserId} className="flex-1">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar miembro..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {users.length === 0 ? (
                          <div className="p-2 text-center text-sm">No hay miembros disponibles</div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-2 text-center text-sm">No hay coincidencias</div>
                        ) : (
                          filteredUsers.map((user) => (
                            <SelectItem key={user._id} value={user._id} disabled={hasAttendanceRecord(user._id)}>
                              <div className="flex items-center gap-2">
                                <span>{user.nombre}</span>
                                {hasAttendanceRecord(user._id) && <Check className="h-4 w-4 text-green-500" />}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      className="gap-1 whitespace-nowrap"
                      disabled={!selectedUserId || hasAttendanceRecord(selectedUserId) || isCheckingIn}
                      onClick={() => handleCheckIn(selectedUserId)}
                    >
                      {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Registrar Entrada
                    </Button>
                  </div>
                </div>

                {/* Registro masivo */}
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-base font-medium mb-3">Registro Masivo de Entradas</h3>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {filteredUsers.slice(0, 8).map((user) => (
                        <div
                          key={user._id}
                          className={cn(
                            "p-2 border rounded-md cursor-pointer flex items-center gap-2",
                            selectedUserIds.includes(user._id) ? "bg-primary/10 border-primary" : "",
                            hasAttendanceRecord(user._id) ? "opacity-50 cursor-not-allowed" : "",
                          )}
                          onClick={() => {
                            if (!hasAttendanceRecord(user._id)) {
                              if (selectedUserIds.includes(user._id)) {
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== user._id))
                              } else {
                                setSelectedUserIds([...selectedUserIds, user._id])
                              }
                            }
                          }}
                        >
                          <Avatar className="h-8 w-8">
                            <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
                              {user.nombre.charAt(0)}
                            </div>
                          </Avatar>
                          <div className="truncate">
                            <div className="font-medium text-sm truncate">{user.nombre}</div>
                            <div className="text-xs text-muted-foreground">{user.cedula}</div>
                          </div>
                          {selectedUserIds.includes(user._id) && <Check className="h-4 w-4 text-primary ml-auto" />}
                          {hasAttendanceRecord(user._id) && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="gap-1 mt-2"
                      disabled={selectedUserIds.length === 0 || isBatchCheckingIn}
                      onClick={handleBatchCheckIn}
                    >
                      {isBatchCheckingIn ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      Registrar {selectedUserIds.length} Entradas
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2">Cargando registros de asistencia...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Miembro</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha</TableHead>
                        <TableHead>Hora de Entrada</TableHead>
                        <TableHead className="hidden sm:table-cell">Hora de Salida</TableHead>
                        <TableHead className="hidden sm:table-cell">Estado</TableHead>
                        <TableHead className="hidden md:table-cell">Asistió</TableHead>
                        <TableHead className="hidden lg:table-cell">Observaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            {searchQuery
                              ? "No hay registros que coincidan con la búsqueda"
                              : viewAllDates
                                ? "No hay registros de asistencia"
                                : "No hay registros de asistencia para esta fecha"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAttendance.map((record) => {
                          const user =
                            record.usuario && typeof record.usuario === "object"
                              ? record.usuario
                              : getUserById(record.usuario as string)

                          const recordDate = new Date(record.fecha).toLocaleDateString("es-ES")

                          return (
                            <TableRow key={record._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
                                      {user?.nombre.charAt(0) || "U"}
                                    </div>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user?.nombre || "Usuario Desconocido"}</div>
                                    <div className="text-xs text-muted-foreground">{user?.cedula || "-"}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{recordDate}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {formatDateTime(record.horaEntrada)}
                                  <Check className="h-4 w-4 text-green-500 ml-1" />
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {record.horaSalida ? (
                                  <div className="flex items-center gap-1">
                                    {formatDateTime(record.horaSalida)}
                                    <Check className="h-4 w-4 text-green-500 ml-1" />
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant={record.horaSalida ? "outline" : "default"}>
                                  {record.horaSalida ? "Completado" : "En Gimnasio"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {record.asistio === false ? (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                ) : (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">{record.observaciones || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {!record.horaSalida && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      disabled={isCheckingOut && checkoutUserId === record._id}
                                      onClick={() => handleCheckOut(record._id)}
                                    >
                                      {isCheckingOut && checkoutUserId === record._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <LogOut className="h-4 w-4" />
                                      )}
                                      <span className="sr-only">Registrar Salida</span>
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => user && openUserDetail(user._id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver Usuario</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditAttendance(record)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteAttendance(record._id)}
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Historial de Asistencia</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filtrar registros..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="absolute right-2.5 top-2.5" onClick={() => setSearchQuery("")}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <DatePickerWithRange className="w-auto" date={dateRange} setDate={setDateRange} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={handleExportData}
                    disabled={isExporting || filteredAttendance.length === 0}
                  >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2">Cargando registros de asistencia...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Miembro</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha</TableHead>
                        <TableHead>Hora de Entrada</TableHead>
                        <TableHead className="hidden sm:table-cell">Hora de Salida</TableHead>
                        <TableHead className="hidden sm:table-cell">Estado</TableHead>
                        <TableHead className="hidden md:table-cell">Asistió</TableHead>
                        <TableHead className="hidden lg:table-cell">Observaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            {searchQuery || dateRange.from || dateRange.to
                              ? "No hay registros que coincidan con los filtros aplicados"
                              : "No hay registros de asistencia disponibles"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAttendance.map((record) => {
                          const user =
                            record.usuario && typeof record.usuario === "object"
                              ? record.usuario
                              : getUserById(record.usuario as string)

                          const recordDate = new Date(record.fecha).toLocaleDateString("es-ES")

                          return (
                            <TableRow key={record._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
                                      {user?.nombre.charAt(0) || "U"}
                                    </div>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user?.nombre || "Usuario Desconocido"}</div>
                                    <div className="text-xs text-muted-foreground">{user?.cedula || "-"}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{recordDate}</TableCell>
                              <TableCell>{formatDateTime(record.horaEntrada)}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {record.horaSalida ? formatDateTime(record.horaSalida) : "-"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant={record.horaSalida ? "outline" : "default"}>
                                  {record.horaSalida ? "Completado" : "En Gimnasio"}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {record.asistio === false ? (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                ) : (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">{record.observaciones || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => user && openUserDetail(user._id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver Usuario</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditAttendance(record)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteAttendance(record._id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle>Asistencia por Día</CardTitle>
                  <Select value={statsTimeframe} onValueChange={setStatsTimeframe}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                      <SelectItem value="30days">Últimos 30 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>Número de asistencias registradas por día</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {statsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#8884d8" name="Asistencias" radius={[4, 4, 0, 0]} barSize={30}>
                        {statsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isToday ? "#4f46e5" : "#8884d8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>No hay datos suficientes para mostrar estadísticas</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Más Frecuentes</CardTitle>
                <CardDescription>Top 10 usuarios con mayor asistencia</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {userAttendanceStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userAttendanceStats}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" name="Asistencias" radius={[0, 4, 4, 0]}>
                        {userAttendanceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>No hay datos suficientes para mostrar estadísticas</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Hora</CardTitle>
                <CardDescription>Asistencias registradas por hora del día</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {hourlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658" name="Asistencias" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>No hay datos suficientes para mostrar estadísticas</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Asistencias</CardTitle>
                <CardDescription>Proporción de asistencias completadas vs en curso</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {attendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Completadas", value: attendance.filter((a) => a.horaSalida).length },
                          { name: "En Gimnasio", value: attendance.filter((a) => !a.horaSalida).length },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#8884d8" />
                        <Cell fill="#82ca9d" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>No hay datos suficientes para mostrar estadísticas</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Control Manual de Asistencia</CardTitle>
                  <CardDescription>Marque la asistencia de los miembros manualmente</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="manual-date" className="mr-2">
                    Fecha:
                  </Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualAttendanceDate}
                    onChange={(e) => setManualAttendanceDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Cargando miembros...</p>
                </div>
              ) : (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar miembro por nombre o cédula..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="absolute right-2.5 top-2.5" onClick={() => setSearchQuery("")}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Miembro</TableHead>
                          <TableHead className="hidden md:table-cell">Plan</TableHead>
                          <TableHead className="hidden sm:table-cell">Estado</TableHead>
                          <TableHead className="text-center">Asistió</TableHead>
                          <TableHead className="text-center">No Asistió</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              {searchQuery
                                ? "No hay miembros que coincidan con la búsqueda"
                                : "No hay miembros disponibles"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => {
                            // Verificar si ya existe un registro para este usuario en esta fecha
                            const existingRecord = attendance.find((record) => {
                              if (!record.usuario) return false

                              const recordUserId =
                                typeof record.usuario === "object" ? record.usuario._id : record.usuario

                              return (
                                recordUserId === user._id &&
                                new Date(record.fecha).toISOString().split("T")[0] === manualAttendanceDate
                              )
                            })

                            // Determinar el estado de asistencia
                            const attended = existingRecord
                              ? existingRecord.asistio !== false
                              : manualAttendanceRecords[user._id] === true

                            return (
                              <TableRow key={user._id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
                                        {user.nombre.charAt(0)}
                                      </div>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{user.nombre}</div>
                                      <div className="text-xs text-muted-foreground">{user.cedula}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {user.plan ? user.plan.nombre : "Sin plan"}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant={user.estado === "activo" ? "default" : "secondary"}>
                                    {user.estado === "activo" ? "Activo" : "Inactivo"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <button
                                      className={cn(
                                        "rounded-full p-1 transition-colors",
                                        (existingRecord && existingRecord.asistio !== false) ||
                                          manualAttendanceRecords[user._id] === true
                                          ? "bg-green-100 text-green-600"
                                          : "text-muted-foreground hover:text-green-600",
                                      )}
                                      onClick={() => handleManualAttendanceChange(user._id, true)}
                                    >
                                      <CheckCircle2 className="h-6 w-6" />
                                    </button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <button
                                      className={cn(
                                        "rounded-full p-1 transition-colors",
                                        (existingRecord && existingRecord.asistio === false) ||
                                          manualAttendanceRecords[user._id] === false
                                          ? "bg-red-100 text-red-600"
                                          : "text-muted-foreground hover:text-red-600",
                                      )}
                                      onClick={() => handleManualAttendanceChange(user._id, false)}
                                    >
                                      <XCircle className="h-6 w-6" />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleSaveManualAttendance}
                      disabled={Object.keys(manualAttendanceRecords).length === 0 || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Asistencias"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para editar asistencia */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Registro de Asistencia</DialogTitle>
            <DialogDescription>Modifique los datos del registro de asistencia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fecha">Fecha</Label>
                <Input
                  id="edit-fecha"
                  type="date"
                  value={editFormData.fecha}
                  onChange={(e) => setEditFormData({ ...editFormData, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-horaEntrada">Hora de Entrada</Label>
                <Input
                  id="edit-horaEntrada"
                  type="datetime-local"
                  value={editFormData.horaEntrada}
                  onChange={(e) => setEditFormData({ ...editFormData, horaEntrada: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-horaSalida">Hora de Salida</Label>
              <Input
                id="edit-horaSalida"
                type="datetime-local"
                value={editFormData.horaSalida}
                onChange={(e) => setEditFormData({ ...editFormData, horaSalida: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-asistio"
                  checked={editFormData.asistio}
                  onChange={(e) => setEditFormData({ ...editFormData, asistio: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-asistio">Asistió</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-observaciones">Observaciones</Label>
              <Textarea
                id="edit-observaciones"
                value={editFormData.observaciones}
                onChange={(e) => setEditFormData({ ...editFormData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de usuario */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      )}

      {/* Modal de escáner QR (simulado) */}
      <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Escanear Código QR</DialogTitle>
            <DialogDescription>Escanee el código QR del miembro para registrar su asistencia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center h-64">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4">Simulación de escáner QR</p>
                <Input
                  placeholder="Ingrese código manualmente (cédula)"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQrScannerOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleQrScan(scannedCode)} disabled={!scannedCode}>
              Registrar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
