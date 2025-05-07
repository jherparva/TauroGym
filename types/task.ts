export interface Task {
    id: string
    nombre: string
    tipo: string
    frecuencia: string
    dia?: string
    hora: string
    activa: boolean
    ultimaEjecucion: string
    proximaEjecucion: string
  }
  