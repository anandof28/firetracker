'use client'

import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridReact } from 'ag-grid-react'

// Register modules
ModuleRegistry.registerModules([AllCommunityModule])

interface TestData {
  name: string
  value: number
}

export default function TestGrid() {
  const testData: TestData[] = [
    { name: 'Test 1', value: 100 },
    { name: 'Test 2', value: 200 },
    { name: 'Test 3', value: 300 },
  ]

  const testColumns: ColDef<TestData>[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'value', headerName: 'Value' },
  ]

  console.log('TestGrid rendering with test data')

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Test AG Grid</h3>
      <div className="ag-theme-alpine" style={{ height: 300, width: '100%' }}>
        <AgGridReact<TestData>
          rowData={testData}
          columnDefs={testColumns}
          onGridReady={(params) => console.log('Test grid ready:', params)}
        />
      </div>
    </div>
  )
}
