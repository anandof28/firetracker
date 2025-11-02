import type { Meta, StoryObj } from '@storybook/react'
import { DataGrid } from './DataGridNew'
import { Theme } from '@/theme'
import { ColumnDef } from '@tanstack/react-table'

type Person = {
  id: number
  name: string
  age: number
  email: string
  status: 'active' | 'inactive'
}

const sampleData: Person[] = [
  { id: 1, name: 'John Doe', age: 32, email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', age: 28, email: 'jane@example.com', status: 'active' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com', status: 'inactive' },
  { id: 4, name: 'Alice Williams', age: 35, email: 'alice@example.com', status: 'active' },
  { id: 5, name: 'Charlie Brown', age: 29, email: 'charlie@example.com', status: 'active' },
  { id: 6, name: 'Diana Prince', age: 31, email: 'diana@example.com', status: 'inactive' },
  { id: 7, name: 'Ethan Hunt', age: 40, email: 'ethan@example.com', status: 'active' },
  { id: 8, name: 'Fiona Green', age: 27, email: 'fiona@example.com', status: 'active' },
  { id: 9, name: 'George Miller', age: 38, email: 'george@example.com', status: 'inactive' },
  { id: 10, name: 'Hannah Lee', age: 33, email: 'hannah@example.com', status: 'active' },
  { id: 11, name: 'Ian Malcolm', age: 42, email: 'ian@example.com', status: 'active' },
  { id: 12, name: 'Julia Roberts', age: 36, email: 'julia@example.com', status: 'inactive' },
]

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'age',
    header: 'Age',
    size: 100,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 500,
            background: status === 'active' ? '#7CC5A0' : '#E88A8A',
            color: '#FFFFFF',
          }}
        >
          {status}
        </span>
      )
    },
  },
]

const meta: Meta<typeof DataGrid> = {
  title: 'Components/DataGrid',
  component: DataGrid as any,
  decorators: [
    (Story) => (
      <Theme>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </Theme>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: sampleData,
    columns: columns as any,
    enableSorting: true,
    enablePagination: true,
    pageSize: 10,
  },
}

export const WithSmallPageSize: Story = {
  args: {
    data: sampleData,
    columns: columns as any,
    enableSorting: true,
    enablePagination: true,
    pageSize: 5,
  },
}

export const WithoutPagination: Story = {
  args: {
    data: sampleData.slice(0, 5),
    columns: columns as any,
    enableSorting: true,
    enablePagination: false,
  },
}

export const WithoutSorting: Story = {
  args: {
    data: sampleData.slice(0, 5),
    columns: columns as any,
    enableSorting: false,
    enablePagination: false,
  },
}

export const SmallDataset: Story = {
  args: {
    data: sampleData.slice(0, 3),
    columns: columns as any,
    enableSorting: true,
    enablePagination: false,
  },
}
