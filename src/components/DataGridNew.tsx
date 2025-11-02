'use client'

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  FilterFn,
} from '@tanstack/react-table'
import styled from 'styled-components'
import { ColorsEnum, ColorsToneEnum, SpacingEnum, ShadowsEnum } from '@/types/cssTypes'

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.neutral.lightest};
  border-radius: ${({ theme }) => theme.borderRadius.rounded};
  box-shadow: ${({ theme }) => theme.shadows.normal};
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.neutral.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.neutral.lighter};
`

const TableHeader = styled.th<{ canSort?: boolean }>`
  padding: ${({ theme }) => theme.spacing.m};
  text-align: left;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.darker};
  cursor: ${({ canSort }) => (canSort ? 'pointer' : 'default')};
  user-select: none;
  transition: background-color 180ms ease;

  &:hover {
    background: ${({ theme, canSort }) =>
      canSort ? theme.colors.neutral.lighter : 'transparent'};
  }

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.lighter};
    transition: background-color 180ms ease;

    &:hover {
      background: ${({ theme }) => theme.colors.neutral.lightest};
    }

    &:last-child {
      border-bottom: none;
    }
  }
`

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.m};
  color: ${({ theme }) => theme.colors.neutral.dark};
`

const SortIcon = styled.span<{ direction?: 'asc' | 'desc' }>`
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.primary.neutral};
  opacity: ${({ direction }) => (direction ? 1 : 0.3)};
`

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.m};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.lighter};
  background: ${({ theme }) => theme.colors.neutral.lightest};
`

const PaginationButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.s}`};
  background: ${({ theme }) => theme.colors.primary.neutral};
  color: ${({ theme }) => theme.colors.neutral.lightest};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.normal};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all 180ms ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PageInfo = styled.span`
  color: ${({ theme }) => theme.colors.neutral.dark};
  font-size: 0.875rem;
`

interface DataGridProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  pageSize?: number
}

export function DataGrid<T>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = false,
  enablePagination = true,
  pageSize = 10,
}: DataGridProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <TableContainer>
      <StyledTable>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <SortIcon direction={header.column.getIsSorted() as 'asc' | 'desc' | undefined}>
                      {header.column.getIsSorted() === 'asc'
                        ? '▲'
                        : header.column.getIsSorted() === 'desc'
                        ? '▼'
                        : '⇅'}
                    </SortIcon>
                  )}
                </TableHeader>
              ))}
            </tr>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </tr>
          ))}
        </TableBody>
      </StyledTable>

      {enablePagination && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </PaginationButton>
          <PageInfo>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </PageInfo>
          <PaginationButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </PaginationButton>
        </PaginationContainer>
      )}
    </TableContainer>
  )
}
