"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Buscar...",
  actions,
  emptyMessage = "Nenhum item encontrado",
  isLoading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar dados baseado na busca
  const filteredData = searchable && searchQuery
    ? data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                {actions && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column, index) => (
                    <TableCell key={index} className={column.className}>
                      {column.render 
                        ? column.render(row)
                        : String(row[column.key as keyof T] || "—")
                      }
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredData.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredData.length} de {data.length} item(s)
          </p>
        </div>
      )}
    </div>
  );
}

// Componentes de utilidade para células comuns
export function StatusBadge({ 
  status, 
  variant 
}: { 
  status: boolean; 
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <Badge variant={status ? (variant || "default") : "secondary"}>
      {status ? "Ativo" : "Inativo"}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const variants = {
    ADMIN: "destructive",
    INSTRUCTOR: "default",
    PROFESSIONAL: "secondary",
    STUDENT: "outline",
  } as const;

  const labels = {
    ADMIN: "Admin",
    INSTRUCTOR: "Instrutor",
    PROFESSIONAL: "Profissional",
    STUDENT: "Estudante",
  } as const;

  return (
    <Badge variant={variants[role as keyof typeof variants] || "outline"}>
      {labels[role as keyof typeof labels] || role}
    </Badge>
  );
}