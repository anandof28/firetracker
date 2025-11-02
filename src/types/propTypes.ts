import { ReactNode } from 'react'

export interface IChildrenNode {
  children: ReactNode
}

export interface IClassName {
  className?: string
}

export interface IButtonProps extends IClassName {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
