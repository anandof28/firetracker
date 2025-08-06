import '@testing-library/jest-dom'

// Extend expect with jest-dom matchers
expect.extend(require('@testing-library/jest-dom/matchers'))

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Setup AG Grid mocks
jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs, ...props }) => (
    <div data-testid="ag-grid-react" {...props}>
      {rowData?.map((row, index) => (
        <div key={index} data-testid={`grid-row-${index}`}>
          {columnDefs?.map((col) => (
            <span key={col.field} data-testid={`cell-${col.field}`}>
              {row[col.field]}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}))

jest.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: jest.fn()
  },
  AllCommunityModule: {}
}))
