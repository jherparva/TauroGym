//C:\Users\jhon\Downloads\tauroGYM1\lib\translations.ts

type Translations = {
  [key: string]: {
    es: string
    en: string
  }
}

export const translations: Translations = {
  // Common
  dashboard: {
    es: "Panel de Control",
    en: "Dashboard",
  },
  users: {
    es: "Usuarios",
    en: "Users",
  },
  memberships: {
    es: "Membresías",
    en: "Memberships",
  },
  routines: {
    es: "Rutinas",
    en: "Routines",
  },
  products: {
    es: "Productos",
    en: "Products",
  },
  payments: {
    es: "Pagos",
    en: "Payments",
  },
  attendance: {
    es: "Asistencia",
    en: "Attendance",
  },
  reports: {
    es: "Reportes",
    en: "Reports",
  },
  support: {
    es: "Soporte",
    en: "Support",
  },
  settings: {
    es: "Configuración",
    en: "Settings",
  },
  logout: {
    es: "Cerrar Sesión",
    en: "Log Out",
  },

  // Attendance Page
  attendanceControl: {
    es: "Control de Asistencia",
    en: "Attendance Control",
  },
  registerAttendance: {
    es: "Registre y gestione la asistencia de los miembros al gimnasio",
    en: "Register and manage gym member attendance",
  },
  date: {
    es: "Fecha",
    en: "Date",
  },
  checkIn: {
    es: "Registrar Entrada",
    en: "Check In",
  },
  checkInDesc: {
    es: "Registre la entrada de miembros al gimnasio",
    en: "Register member entry to the gym",
  },
  selectMember: {
    es: "Seleccionar Miembro",
    en: "Select Member",
  },
  observations: {
    es: "Observaciones (opcional)",
    en: "Observations (optional)",
  },
  observationsPlaceholder: {
    es: "Escriba cualquier observación relevante",
    en: "Write any relevant observations",
  },
  registering: {
    es: "Registrando...",
    en: "Registering...",
  },
  todayStats: {
    es: "Estadísticas de Hoy",
    en: "Today's Statistics",
  },
  todaySummary: {
    es: "Resumen de la asistencia del día",
    en: "Summary of today's attendance",
  },
  totalEntries: {
    es: "Total Entradas",
    en: "Total Entries",
  },
  presentNow: {
    es: "Presentes Ahora",
    en: "Present Now",
  },
  attendanceLog: {
    es: "Registro de Asistencia",
    en: "Attendance Log",
  },
  searchMembers: {
    es: "Buscar miembros...",
    en: "Search members...",
  },
  filters: {
    es: "Filtros",
    en: "Filters",
  },
  member: {
    es: "Miembro",
    en: "Member",
  },
  entryTime: {
    es: "Hora de Entrada",
    en: "Entry Time",
  },
  exitTime: {
    es: "Hora de Salida",
    en: "Exit Time",
  },
  status: {
    es: "Estado",
    en: "Status",
  },
  actions: {
    es: "Acciones",
    en: "Actions",
  },
  completed: {
    es: "Completado",
    en: "Completed",
  },
  inGym: {
    es: "En Gimnasio",
    en: "At Gym",
  },
  registerExit: {
    es: "Registrar Salida",
    en: "Register Exit",
  },
  noRecords: {
    es: "No hay registros de asistencia para esta fecha",
    en: "No attendance records for this date",
  },
  loading: {
    es: "Cargando...",
    en: "Loading...",
  },
  loadingAttendance: {
    es: "Cargando registros de asistencia...",
    en: "Loading attendance records...",
  },

  // Memberships Page
  membershipPlans: {
    es: "Planes de Membresía",
    en: "Membership Plans",
  },
  manageMemberships: {
    es: "Administra los planes de membresía y precios del gimnasio",
    en: "Manage gym membership plans and pricing",
  },
  createNewPlan: {
    es: "Crear Nuevo Plan",
    en: "Create New Plan",
  },
  editPlan: {
    es: "Editar Plan",
    en: "Edit Plan",
  },
  deletePlan: {
    es: "Eliminar Plan",
    en: "Delete Plan",
  },
  planName: {
    es: "Nombre",
    en: "Name",
  },
  planDescription: {
    es: "Descripción",
    en: "Description",
  },
  planPrice: {
    es: "Precio",
    en: "Price",
  },
  planDuration: {
    es: "Duración (días)",
    en: "Duration (days)",
  },
  planBenefits: {
    es: "Beneficios (uno por línea)",
    en: "Benefits (one per line)",
  },
  planStatus: {
    es: "Estado",
    en: "Status",
  },
  active: {
    es: "Activo",
    en: "Active",
  },
  inactive: {
    es: "Inactivo",
    en: "Inactive",
  },
  cancel: {
    es: "Cancelar",
    en: "Cancel",
  },
  update: {
    es: "Actualizar",
    en: "Update",
  },
  create: {
    es: "Crear",
    en: "Create",
  },
  areYouSure: {
    es: "¿Estás seguro?",
    en: "Are you sure?",
  },
  deleteConfirmation: {
    es: "Esta acción eliminará permanentemente el plan. Esta acción no se puede deshacer.",
    en: "This action will permanently delete the plan. This action cannot be undone.",
  },
  noPlans: {
    es: "No hay planes de membresía disponibles",
    en: "No membership plans available",
  },
  createFirstPlan: {
    es: "Crear Primer Plan",
    en: "Create First Plan",
  },
  loadingPlans: {
    es: "Cargando planes...",
    en: "Loading plans...",
  },
  monthly: {
    es: "Mensual",
    en: "Monthly",
  },
  annual: {
    es: "Anual",
    en: "Annual",
  },
  days: {
    es: "días",
    en: "days",
  },
  benefits: {
    es: "Beneficios:",
    en: "Benefits:",
  },
  error: {
    es: "Error",
    en: "Error",
  },
  errorLoadingPlans: {
    es: "No se pudieron cargar los planes",
    en: "Could not load plans",
  },
}

export function getTranslation(key: string, language: "es" | "en" = "es"): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`)
    return key
  }

  return translations[key][language]
}