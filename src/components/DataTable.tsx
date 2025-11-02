'use client'

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import { tokens } from '@/design/tokens'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  enableSorting?: boolean
  enablePagination?: boolean
  pageSize?: number
}

export function DataTable<T>({
  data,
  columns,
  enableSorting = true,
  enablePagination = true,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}>
        <thead style={{
          backgroundColor: '#F9FAFB',
          borderBottom: '2px solid #E5E7EB',
        }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'background-color 180ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (header.column.getCanSort()) {
                      e.currentTarget.style.backgroundColor = '#F3F4F6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span style={{
                        fontSize: '12px',
                        color: tokens.colors.light.primary,
                        opacity: header.column.getIsSorted() ? 1 : 0.3,
                      }}>
                        {header.column.getIsSorted() === 'asc'
                          ? '▲'
                          : header.column.getIsSorted() === 'desc'
                          ? '▼'
                          : '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid #E5E7EB',
                transition: 'background-color 180ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '12px 16px',
                    color: '#4B5563',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {enablePagination && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
        }}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '6px 12px',
              backgroundColor: tokens.colors.light.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: !table.getCanPreviousPage() ? 'not-allowed' : 'pointer',
              transition: 'all 180ms ease',
              opacity: !table.getCanPreviousPage() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (table.getCanPreviousPage()) {
                e.currentTarget.style.backgroundColor = tokens.colors.light.primaryHover
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.light.primary
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Previous
          </button>
          <span style={{
            color: '#4B5563',
            fontSize: '14px',
          }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '6px 12px',
              backgroundColor: tokens.colors.light.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: !table.getCanNextPage() ? 'not-allowed' : 'pointer',
              transition: 'all 180ms ease',
              opacity: !table.getCanNextPage() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (table.getCanNextPage()) {
                e.currentTarget.style.backgroundColor = tokens.colors.light.primaryHover
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.light.primary
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
