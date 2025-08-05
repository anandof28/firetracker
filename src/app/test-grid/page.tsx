'use client'

import { AgGridReact } from 'ag-grid-react'
import { useEffect, useState } from 'react'

export default function TestGrid() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const columnDefs = [
    { field: 'name' as const, headerName: 'Name' },
    { field: 'value' as const, headerName: 'Value' }
  ]

  const rowData = [
    { name: 'Test 1', value: 100 },
    { name: 'Test 2', value: 200 },
    { name: 'Test 3', value: 300 }
  ]

  return (
    <div className="p-6">
      <h1>AG Grid Test</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true
          }}
        />
      </div>
    </div>
  )
}
