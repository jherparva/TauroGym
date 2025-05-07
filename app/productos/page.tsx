//C:\Users\jhon\Downloads\tauroGYM1\app\productos\page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { 
  Plus, Search, Edit, Trash, AlertTriangle, ShoppingCart,
  Calendar, Printer, BarChart3, ArrowRight, ChevronDown 
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../omponents/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns"
import { es } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

// Tipo para nuestro producto
interface Producto {
  _id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  estado: "activo" | "inactivo"
}

// Tipo para los items de venta
interface ItemVenta {
  producto: Producto
  cantidad: number
  precio: number
  subtotal: number
}

// Tipo para ventas
interface Venta {
  _id: string
  productos: {
    producto: Producto
    cantidad: number
    precio: number
  }[]
  total: number
  fecha: string
  createdAt: string
}

// Formatear moneda colombiana (COP)
const formatearMonedaCOP = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

// Mapear los nombres de campo del inglés al español
const mapearCamposParaAPI = (datos) => {
  return {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    categoria: datos.categoria,
    estado: datos.estado
  };
};

// Mapear los nombres de campo del español al inglés
const mapearCamposDesdeBD = (producto) => {
  // Si el producto ya tiene la estructura correcta, devolverlo tal cual
  if (producto.nombre !== undefined) {
    return producto;
  }
  
  // Si no, mapear desde la estructura en inglés
  return {
    _id: producto._id,
    nombre: producto.name || "",
    descripcion: producto.description || "",
    precio: producto.price || 0,
    stock: producto.stock || 0,
    categoria: producto.category || "",
    estado: producto.status === "active" ? "activo" : "inactivo"
  };
};

export default function PaginaProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [categorias, setCategorias] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para la venta actual
  const [itemsVenta, setItemsVenta] = useState<ItemVenta[]>([])
  const [totalVenta, setTotalVenta] = useState(0)
  const [modalVentaAbierto, setModalVentaAbierto] = useState(false)
  
  // Estados para reportes
  const [ventas, setVentas] = useState<Venta[]>([])
  const [ventasCargando, setVentasCargando] = useState(false)
  const [fechaInicio, setFechaInicio] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [fechaFin, setFechaFin] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [productosMasVendidos, setProductosMasVendidos] = useState<{nombre: string, cantidad: number, total: number}[]>([])
  const [ventasPorDia, setVentasPorDia] = useState<{fecha: string, total: number}[]>([])
  
  // Estados para el modal de añadir/editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [productoActual, setProductoActual] = useState<Producto | null>(null)
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "",
    estado: "activo" as "activo" | "inactivo"
  })

  // Cargar productos
  useEffect(() => {
    cargarProductos()
  }, [filtroTexto, filtroCategoria])

  // Cargar ventas cuando cambien las fechas
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarVentas()
    }
  }, [fechaInicio, fechaFin])

  // Calcular total de la venta cuando cambian los items
  useEffect(() => {
    const total = itemsVenta.reduce((sum, item) => sum + item.subtotal, 0)
    setTotalVenta(total)
  }, [itemsVenta])

  const cargarProductos = async () => {
    setCargando(true)
    setError(null)
    try {
      let url = '/api/productos?'
      
      if (filtroTexto) {
        url += `query=${encodeURIComponent(filtroTexto)}&`
      }
      
      if (filtroCategoria && filtroCategoria !== "todas") {
        url += `categoria=${encodeURIComponent(filtroCategoria)}`
      }
      
      console.log('Consultando URL:', url)
      const respuesta = await fetch(url)
      
      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }
      
      const datos = await respuesta.json()
      console.log('Datos recibidos:', datos)
      
      // Procesar datos dependiendo de la estructura recibida
      let productosData = datos;
      
      // Si los datos vienen en formato { productos: [...] }
      if (datos.productos && Array.isArray(datos.productos)) {
        productosData = datos.productos;
      }
      
      // Asegurarnos que tenemos un array para mapear
      if (!Array.isArray(productosData)) {
        console.error('Formato de datos incorrecto:', datos)
        throw new Error('El formato de datos recibido no es válido')
      }
      
      // Mapear todos los productos al formato español
      const productosFormateados = productosData.map(mapearCamposDesdeBD)
      console.log('Productos formateados:', productosFormateados)
      
      setProductos(productosFormateados)
      
      // Extraer categorías únicas
      if (productosFormateados.length > 0) {
        const categoriasUnicas = Array.from(
          new Set(productosFormateados.map((p: Producto) => p.categoria).filter(Boolean))
        )
        setCategorias(categoriasUnicas as string[])
      }
      
    } catch (err) {
      console.error("Error al cargar productos:", err)
      setError(`No se pudieron cargar los productos: ${err.message || "Error desconocido"}`)
    } finally {
      setCargando(false)
    }
  }

  const cargarVentas = async () => {
    setVentasCargando(true)
    try {
      const url = `/api/ventas?desde=${fechaInicio}&hasta=${fechaFin}`
      const respuesta = await fetch(url)
      
      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }
      
      const { ventas } = await respuesta.json()
      setVentas(ventas)
      
      // Procesar datos para reportes
      procesarDatosReporte(ventas)
      
    } catch (err) {
      console.error("Error al cargar ventas:", err)
      setError(`No se pudieron cargar las ventas: ${err.message || "Error desconocido"}`)
    } finally {
      setVentasCargando(false)
    }
  }

  const procesarDatosReporte = (ventas: Venta[]) => {
    // Productos más vendidos
    const productosMap = new Map()
    
    ventas.forEach(venta => {
      venta.productos.forEach(item => {
        const productoId = item.producto._id
        const nombre = item.producto.nombre
        const cantidad = item.cantidad
        const total = item.precio * item.cantidad
        
        if (productosMap.has(productoId)) {
          const actual = productosMap.get(productoId)
          productosMap.set(productoId, {
            nombre,
            cantidad: actual.cantidad + cantidad,
            total: actual.total + total
          })
        } else {
          productosMap.set(productoId, { nombre, cantidad, total })
        }
      })
    })
    
    const productosList = Array.from(productosMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
    
    setProductosMasVendidos(productosList)
    
    // Ventas por día
    const ventasPorDiaMap = new Map()
    
    ventas.forEach(venta => {
      const fecha = format(new Date(venta.fecha), 'yyyy-MM-dd')
      
      if (ventasPorDiaMap.has(fecha)) {
        ventasPorDiaMap.set(fecha, ventasPorDiaMap.get(fecha) + venta.total)
      } else {
        ventasPorDiaMap.set(fecha, venta.total)
      }
    })
    
    const ventasPorDiaList = Array.from(ventasPorDiaMap.entries())
      .map(([fecha, total]) => ({ fecha, total }))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    
    setVentasPorDia(ventasPorDiaList)
  }

  // Abrir modal para crear producto
  const abrirModalCrear = () => {
    setModoEdicion(false)
    setProductoActual(null)
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      stock: 0,
      categoria: "",
      estado: "activo"
    })
    setModalAbierto(true)
  }

  // Abrir modal para editar producto
  const abrirModalEditar = (producto: Producto) => {
    setModoEdicion(true)
    setProductoActual(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
      estado: producto.estado
    })
    setModalAbierto(true)
  }

  // Manejar cambios en el formulario
  const manejarCambioFormulario = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "precio" || name === "stock" ? parseFloat(value) : value
    })
  }

  // Manejar cambios en selects
  const manejarCambioSelect = (nombre: string, valor: string) => {
    setFormData({
      ...formData,
      [nombre]: valor
    })
  }

  // Guardar producto (crear o actualizar)
  const guardarProducto = async () => {
    try {
      if (modoEdicion && productoActual) {
        // Actualizar producto existente
        const respuesta = await fetch(`/api/productos/${productoActual._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mapearCamposParaAPI(formData)),
        })

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.error || "Error al actualizar el producto")
        }
      } else {
        // Crear nuevo producto
        const respuesta = await fetch('/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mapearCamposParaAPI(formData)),
        })

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.error || "Error al crear el producto")
        }
      }
      
      // Recargar productos y cerrar modal
      await cargarProductos()
      setModalAbierto(false)
      
    } catch (err) {
      console.error("Error al guardar el producto:", err)
      setError(`Error al guardar el producto: ${err.message}`)
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este producto?")) {
      try {
        const respuesta = await fetch(`/api/productos/${id}`, {
          method: 'DELETE',
        })

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.error || "Error al eliminar el producto")
        }

        // Recargar productos
        await cargarProductos()
        
      } catch (err) {
        console.error("Error al eliminar el producto:", err)
        setError(`Error al eliminar el producto: ${err.message}`)
      }
    }
  }

  // Abrir modal de venta
  const abrirModalVenta = () => {
    setItemsVenta([])
    setTotalVenta(0)
    setModalVentaAbierto(true)
  }

  // Añadir producto a la venta
  const agregarProductoAVenta = (producto: Producto) => {
    // Verificar si el producto ya está en la lista
    const itemExistente = itemsVenta.find(item => item.producto._id === producto._id)
    
    if (itemExistente) {
      // Si ya existe y hay stock suficiente, aumentar cantidad
      if (itemExistente.cantidad < producto.stock) {
        const nuevosItems = itemsVenta.map(item => 
          item.producto._id === producto._id 
            ? { 
                ...item, 
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio
              }
            : item
        )
        setItemsVenta(nuevosItems)
      } else {
        alert(`No hay suficiente stock de ${producto.nombre}`)
      }
    } else {
      // Si no existe y hay stock, añadir a la lista
      if (producto.stock > 0) {
        setItemsVenta([
          ...itemsVenta,
          {
            producto,
            cantidad: 1,
            precio: producto.precio,
            subtotal: producto.precio
          }
        ])
      } else {
        alert(`No hay stock disponible de ${producto.nombre}`)
      }
    }
  }

  // Eliminar producto de la venta
  const eliminarProductoDeVenta = (productoId: string) => {
    setItemsVenta(itemsVenta.filter(item => item.producto._id !== productoId))
  }

  // Cambiar cantidad de un producto en la venta
  const cambiarCantidadProducto = (productoId: string, nuevaCantidad: number) => {
    const producto = productos.find(p => p._id === productoId)
    
    if (!producto || nuevaCantidad > producto.stock) {
      alert(`No hay suficiente stock de este producto`)
      return
    }
    
    if (nuevaCantidad <= 0) {
      eliminarProductoDeVenta(productoId)
      return
    }
    
    const nuevosItems = itemsVenta.map(item => 
      item.producto._id === productoId 
        ? { 
            ...item, 
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * item.precio
          }
        : item
    )
    
    setItemsVenta(nuevosItems)
  }

  // Procesar venta
  const procesarVenta = async () => {
    if (itemsVenta.length === 0) {
      alert("No hay productos en la venta")
      return
    }
    
    try {
      const venta = {
        productos: itemsVenta.map(item => ({
          producto: item.producto._id,
          cantidad: item.cantidad,
          precio: item.precio
        })),
        total: totalVenta,
        fecha: new Date().toISOString()
      }
      
      const respuesta = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venta),
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.error || "Error al procesar la venta")
      }
      
      // Recargar productos para actualizar stock
      await cargarProductos()
      
      // Si estamos en la pestaña de reportes y el periodo incluye la fecha actual
      // recargar también las ventas
      const hoy = format(new Date(), 'yyyy-MM-dd')
      if (fechaInicio <= hoy && fechaFin >= hoy) {
        await cargarVentas()
      }
      
      // Cerrar modal y mostrar mensaje de éxito
      setModalVentaAbierto(false)
      alert("Venta procesada con éxito")
      
    } catch (err) {
      console.error("Error al procesar la venta:", err)
      setError(`Error al procesar la venta: ${err.message}`)
    }
  }

  // Seleccionar periodo para los reportes
  const seleccionarPeriodo = (periodo: string) => {
    const hoy = new Date()
    
    switch (periodo) {
      case "hoy":
        const fechaHoy = format(hoy, 'yyyy-MM-dd')
        setFechaInicio(fechaHoy)
        setFechaFin(fechaHoy)
        break
      case "semana":
        const inicioSemana = new Date(hoy)
        inicioSemana.setDate(hoy.getDate() - hoy.getDay())
        setFechaInicio(format(inicioSemana, 'yyyy-MM-dd'))
        setFechaFin(format(hoy, 'yyyy-MM-dd'))
        break
      case "mes":
        setFechaInicio(format(startOfMonth(hoy), 'yyyy-MM-dd'))
        setFechaFin(format(endOfMonth(hoy), 'yyyy-MM-dd'))
        break
      case "mes-anterior":
        const mesAnterior = subMonths(hoy, 1)
        setFechaInicio(format(startOfMonth(mesAnterior), 'yyyy-MM-dd'))
        setFechaFin(format(endOfMonth(mesAnterior), 'yyyy-MM-dd'))
        break
    }
  }

  // Imprimir reporte
  const imprimirReporte = () => {
    window.print()
  }

  // Contar productos con stock bajo (≤ 10) y fuera de stock (0)
  const productosStockBajo = productos.filter(p => p.stock > 0 && p.stock <= 10).length
  const productosSinStock = productos.filter(p => p.stock === 0).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs defaultValue="inventario" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="ventas">Ventas y Reportes</TabsTrigger>
        </TabsList>
        
        {/* Tab de Inventario */}
        <TabsContent value="inventario">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Productos e Inventario</h1>
              <p className="text-muted-foreground">Gestiona productos del gimnasio, suplementos y accesorios</p>
            </div>
            <div className="flex gap-2">
              <Button className="gap-2" onClick={abrirModalVenta}>
                <ShoppingCart className="h-4 w-4" /> Nueva Venta
              </Button>
              <Button className="gap-2" onClick={abrirModalCrear}>
                <Plus className="h-4 w-4" /> Añadir Producto
              </Button>
            </div>
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productos.length}</div>
                <p className="text-xs text-muted-foreground">
                  En {categorias.length} categorías
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productosStockBajo}</div>
                <p className="text-xs text-muted-foreground">Productos que necesitan reposición pronto</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productosSinStock}</div>
                <p className="text-xs text-muted-foreground">Productos actualmente no disponibles</p>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Gestión de Inventario</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
                      className="pl-8"
                      value={filtroTexto}
                      onChange={(e) => setFiltroTexto(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={filtroCategoria} 
                    onValueChange={(valor) => setFiltroCategoria(valor)}
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cargando ? (
                <div className="text-center py-4">Cargando productos...</div>
              ) : productos.length === 0 ? (
                <div className="text-center py-4">No se encontraron productos</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productos.map((producto) => (
                      <TableRow key={producto._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-xs text-muted-foreground">{producto.descripcion}</div>
                          </div>
                        </TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell className="text-right">{formatearMonedaCOP(producto.precio)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {producto.stock === 0 ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" /> Sin stock
                              </Badge>
                            ) : producto.stock <= 10 ? (
                              <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500">
                                <AlertTriangle className="h-3 w-3" /> Bajo: {producto.stock}
                              </Badge>
                            ) : (
                              producto.stock
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={producto.estado === "activo" ? "default" : "destructive"}>
                            {producto.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {producto.stock > 0 && producto.estado === "activo" && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => agregarProductoAVenta(producto)}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                <span className="sr-only">Vender</span>
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => abrirModalEditar(producto)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => eliminarProducto(producto._id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Ventas y Reportes */}
        <TabsContent value="ventas">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Ventas y Reportes</h1>
              <p className="text-muted-foreground">Gestión de ventas diarias y reportes mensuales</p>
            </div>
            <div className="flex gap-2">
              <Button className="gap-2" onClick={abrirModalVenta}>
                <ShoppingCart className="h-4 w-4" /> Nueva Venta
              </Button>
              <Button variant="outline" className="gap-2" onClick={imprimirReporte}>
                <Printer className="h-4 w-4" /> Imprimir Reporte
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Card className="flex-1">
            // Continuación del código para la página de productos

          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Período de reporte</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    Seleccionar período
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => seleccionarPeriodo("hoy")}>
                    Hoy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => seleccionarPeriodo("semana")}>
                    Esta semana
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => seleccionarPeriodo("mes")}>
                    Este mes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => seleccionarPeriodo("mes-anterior")}>
                    Mes anterior
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fecha-inicio">Fecha inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fecha-fin">Fecha fin</Label>
                  <Input
                    id="fecha-fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={cargarVentas} disabled={ventasCargando}>
                {ventasCargando ? "Cargando..." : "Generar reporte"}
              </Button>
            </div>
          </CardContent>
          </Card>

          <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Resumen de ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total ventas</div>
                <div className="text-2xl font-bold">
                  {formatearMonedaCOP(ventas.reduce((sum, venta) => sum + venta.total, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Número de ventas</div>
                <div className="text-2xl font-bold">{ventas.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Promedio por venta</div>
                <div className="text-2xl font-bold">
                  {ventas.length > 0
                    ? formatearMonedaCOP(
                        ventas.reduce((sum, venta) => sum + venta.total, 0) / ventas.length
                      )
                    : formatearMonedaCOP(0)}
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Historial de ventas</CardTitle>
          </CardHeader>
          <CardContent>
            {ventasCargando ? (
              <div className="text-center py-4">Cargando ventas...</div>
            ) : ventas.length === 0 ? (
              <div className="text-center py-4">No hay ventas en el período seleccionado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta._id}>
                      <TableCell>
                        {format(parseISO(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {venta.productos.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.cantidad} x {item.producto.nombre}
                            </div>
                          ))}
                          {venta.productos.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              Y {venta.productos.length - 2} productos más...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatearMonedaCOP(venta.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(`/ventas/${venta._id}`, '_blank')}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          </Card>

          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top 5 productos más vendidos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productosMasVendidos.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  No hay datos disponibles
                </div>
              ) : (
                productosMasVendidos.map((producto, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {producto.nombre}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{producto.cantidad} vendidos</span>
                        <span className="ml-2">
                          ({formatearMonedaCOP(producto.total)})
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              (producto.cantidad / (productosMasVendidos[0]?.cantidad || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          </Card>

          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas diarias en el período
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ventasPorDia.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  No hay datos disponibles
                </div>
              ) : (
                ventasPorDia.map((dia, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {format(parseISO(dia.fecha), 'dd/MM/yyyy (EEEE)', { locale: es })}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {formatearMonedaCOP(dia.total)}
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              (dia.total / (ventasPorDia.reduce((max, d) => Math.max(max, d.total), 0) || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          </Card>
          </div>
          </TabsContent>
          </Tabs>

          {/* Modal para Añadir/Editar Producto */}
          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
          <DialogTitle>{modoEdicion ? "Editar Producto" : "Añadir Producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
          <div className="grid gap-2">
          <Label htmlFor="nombre">Nombre del producto</Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={manejarCambioFormulario}
          />
          </div>
          <div className="grid gap-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={manejarCambioFormulario}
          />
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="precio">Precio (COP)</Label>
            <Input
              id="precio"
              name="precio"
              type="number"
              value={formData.precio}
              onChange={manejarCambioFormulario}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={manejarCambioFormulario}
            />
          </div>
          </div>
          <div className="grid gap-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Input
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={manejarCambioFormulario}
            list="categorias-lista"
          />
          <datalist id="categorias-lista">
            {categorias.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          </div>
          <div className="grid gap-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={formData.estado}
            onValueChange={(valor) => manejarCambioSelect("estado", valor)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          </div>
          </div>
          <DialogFooter>
          <Button variant="outline" onClick={() => setModalAbierto(false)}>
          Cancelar
          </Button>
          <Button onClick={guardarProducto}>Guardar</Button>
          </DialogFooter>
          </DialogContent>
          </Dialog>

          {/* Modal para Nueva Venta */}
          <Dialog open={modalVentaAbierto} onOpenChange={setModalVentaAbierto}>
          <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
          <div className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Buscar productos..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filtroCategoria}
            onValueChange={(valor) => setFiltroCategoria(valor)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div className="max-h-72 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos
                .filter((p) => p.stock > 0 && p.estado === "activo")
                .map((producto) => (
                  <TableRow key={producto._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{producto.nombre}</div>
                        <div className="text-xs text-muted-foreground">{producto.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatearMonedaCOP(producto.precio)}</TableCell>
                    <TableCell className="text-center">{producto.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => agregarProductoAVenta(producto)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          </div>

          <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsVenta.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay productos en la venta
                  </TableCell>
                </TableRow>
              ) : (
                itemsVenta.map((item) => (
                  <TableRow key={item.producto._id}>
                    <TableCell>
                      <div className="font-medium">{item.producto.nombre}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => cambiarCantidadProducto(item.producto._id, item.cantidad - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.cantidad}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => cambiarCantidadProducto(item.producto._id, item.cantidad + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatearMonedaCOP(item.precio)}</TableCell>
                    <TableCell className="text-right">{formatearMonedaCOP(item.subtotal)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => eliminarProductoDeVenta(item.producto._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {itemsVenta.length > 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total:
                  </TableCell>
                  <TableCell colSpan={2} className="text-right font-bold">
                    {formatearMonedaCOP(totalVenta)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
          </div>
          <DialogFooter>
          <div className="flex justify-between w-full">
          <Button variant="outline" onClick={() => setModalVentaAbierto(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={procesarVenta} 
            disabled={itemsVenta.length === 0}
          >
            Completar Venta (Efectivo)
          </Button>
          </div>
          </DialogFooter>
          </DialogContent>
          </Dialog>
          </div>
  );
}