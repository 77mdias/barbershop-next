"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
  showPageNumbers?: boolean;
  showItemsCount?: boolean;
  showFirstLast?: boolean;
}

/**
 * PaginationControls Component
 *
 * Controles de paginação com page numbers inteligentes e informações de itens.
 *
 * @example
 * ```tsx
 * <PaginationControls
 *   currentPage={2}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   totalItems={200}
 *   itemsPerPage={20}
 *   showPageNumbers
 *   showItemsCount
 * />
 * ```
 *
 * Page numbers display logic:
 * - Sempre mostra primeira e última página
 * - Mostra current page +/- 1
 * - Usa "..." para gaps
 * - Exemplo: 1 ... 4 5 6 ... 10
 *
 * @param currentPage - Página atual (1-indexed)
 * @param totalPages - Total de páginas
 * @param onPageChange - Callback quando a página muda
 * @param totalItems - Total de itens
 * @param itemsPerPage - Itens por página
 * @param showPageNumbers - Mostrar números das páginas (padrão: true)
 * @param showItemsCount - Mostrar contagem de itens (padrão: true)
 * @param showFirstLast - Mostrar botões primeira/última (padrão: false)
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className,
  showPageNumbers = true,
  showItemsCount = true,
  showFirstLast = false,
}: PaginationControlsProps) {
  // Calcula range de itens sendo exibidos
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gera array de page numbers para exibir
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      // Se tem 7 ou menos páginas, mostra todas
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Sempre mostra primeira página
    pages.push(1);

    // Lógica para páginas do meio
    if (currentPage <= 3) {
      // Início: 1 2 3 4 ... 10
      pages.push(2, 3, 4, "...");
    } else if (currentPage >= totalPages - 2) {
      // Fim: 1 ... 7 8 9 10
      pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      // Meio: 1 ... 4 5 6 ... 10
      pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
    }

    // Sempre mostra última página
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Items count */}
      {showItemsCount && (
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          Mostrando{" "}
          <span className="font-medium text-gray-900">
            {startItem}-{endItem}
          </span>{" "}
          de{" "}
          <span className="font-medium text-gray-900">{totalItems}</span>{" "}
          {totalItems === 1 ? "item" : "itens"}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* First page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            className="hidden sm:flex"
            aria-label="Primeira página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden md:flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "w-9 h-9 p-0",
                    isActive && "bg-blue-600 hover:bg-blue-700"
                  )}
                  aria-label={`Página ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
        )}

        {/* Current page badge (mobile) */}
        {showPageNumbers && (
          <Badge variant="outline" className="md:hidden">
            {currentPage} / {totalPages}
          </Badge>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="w-4 h-4 sm:ml-2" />
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            className="hidden sm:flex"
            aria-label="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
