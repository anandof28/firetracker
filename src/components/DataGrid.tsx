import { AllCommunityModule, DomLayoutType, ModuleRegistry } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridReact } from 'ag-grid-react'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

interface DataGridProps {
  columnDefs: any[]
  rowData: any[]
  defaultColDef?: any
  pagination?: boolean
  paginationPageSize?: number
  domLayout?: DomLayoutType
  onGridReady?: (params: any) => void
  getRowId?: (params: any) => string
  className?: string
}

export default function DataGrid({
  columnDefs,
  rowData,
  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  },
  pagination = true,
  paginationPageSize = 10,
  domLayout = 'normal',
  onGridReady,
  getRowId,
  className = '',
}: DataGridProps) {
  console.log('DataGrid rendering with:', { 
    rowDataLength: rowData?.length,
    columnDefsLength: columnDefs?.length,
    firstRow: rowData?.[0]
  })
  
  if (!rowData || !columnDefs) {
    console.log('Missing required props:', { rowData: !!rowData, columnDefs: !!columnDefs })
    return <div>Missing data or column definitions</div>
  }
  
  return (
    <div className={`ag-theme-alpine ${className}`} style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        domLayout={domLayout}
        onGridReady={onGridReady}
        getRowId={getRowId}
        theme="legacy"
      />
    </div>
  )
}
