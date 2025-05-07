import { Avatar } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const members = [
  {
    id: "1",
    name: "Carlos Mendoza",
    cedula: "V-12345678",
    plan: "Premium",
    startDate: "05.10.2023",
    endDate: "05.10.2024",
    status: "active",
    phone: "+58 412-555-1234",
  },
  {
    id: "2",
    name: "María González",
    cedula: "V-23456789",
    plan: "Standard",
    startDate: "12.03.2023",
    endDate: "12.06.2023",
    status: "expired",
    phone: "+58 414-555-5678",
  },
  {
    id: "3",
    name: "Juan Pérez",
    cedula: "V-34567890",
    plan: "Basic",
    startDate: "21.01.2023",
    endDate: "21.07.2023",
    status: "active",
    phone: "+58 416-555-9012",
  },
  {
    id: "4",
    name: "Ana Rodríguez",
    cedula: "V-45678901",
    plan: "Premium",
    startDate: "15.05.2023",
    endDate: "15.05.2024",
    status: "active",
    phone: "+58 424-555-3456",
  },
  {
    id: "5",
    name: "Luis Martínez",
    cedula: "V-56789012",
    plan: "Standard",
    startDate: "03.04.2023",
    endDate: "03.07.2023",
    status: "pending",
    phone: "+58 412-555-7890",
  },
]

export function MembersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center font-semibold">
                    {member.name.charAt(0)}
                  </div>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.cedula}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{member.plan}</TableCell>
            <TableCell>{member.startDate}</TableCell>
            <TableCell>{member.endDate}</TableCell>
            <TableCell>
              <Badge
                variant={
                  member.status === "active" ? "default" : member.status === "expired" ? "destructive" : "outline"
                }
              >
                {member.status}
              </Badge>
            </TableCell>
            <TableCell>{member.phone}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Edit className="h-4 w-4" /> Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                    <Trash className="h-4 w-4" /> Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
