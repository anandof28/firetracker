import type { Meta, StoryObj } from '@storybook/react'
import PageHeader from './PageHeader'
import { Theme } from '@/theme'

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  decorators: [
    (Story) => (
      <Theme>
        <Story />
      </Theme>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    buttonColor: {
      control: 'select',
      options: ['primary', 'secondary', 'accent'],
      description: 'Color scheme for the action button',
    },
    onButtonClick: { action: 'button clicked' },
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    title: 'Bank Accounts',
    description: 'Manage your bank accounts and balances',
    buttonText: 'Add Account',
    buttonColor: 'primary',
    onButtonClick: () => console.log('Add Account clicked'),
  },
}

export const Secondary: Story = {
  args: {
    title: 'Gold Investments',
    description: 'Track your gold purchases and current value',
    buttonText: 'Add Gold',
    buttonColor: 'secondary',
    onButtonClick: () => console.log('Add Gold clicked'),
  },
}

export const Accent: Story = {
  args: {
    title: 'Transactions',
    description: 'View and manage your income and expenses',
    buttonText: 'Add Transaction',
    buttonColor: 'accent',
    onButtonClick: () => console.log('Add Transaction clicked'),
  },
}

export const LongTexts: Story = {
  args: {
    title: 'Fixed Deposits with Long Title Example',
    description: 'This is a longer description text to show how the component handles more content. It should wrap nicely and maintain proper spacing.',
    buttonText: 'Add New Fixed Deposit',
    buttonColor: 'primary',
    onButtonClick: () => console.log('Add FD clicked'),
  },
}
