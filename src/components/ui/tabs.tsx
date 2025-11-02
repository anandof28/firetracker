import * as React from "react"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || '')

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = React.useCallback((newValue: string) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  return (
    <div
      ref={ref}
      className={`w-full ${className || ''}`}
      {...props}
      data-active-tab={activeTab}
      data-on-tab-change={handleTabChange}
    />
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground bg-gray-100 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const tabsElement = React.useContext(TabsContext)
  
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-white hover:text-gray-900 ${className || ''}`}
      data-state={tabsElement?.activeTab === value ? 'active' : 'inactive'}
      onClick={() => tabsElement?.onTabChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const tabsElement = React.useContext(TabsContext)
  
  if (tabsElement?.activeTab !== value) {
    return null
  }

  return (
    <div
      ref={ref}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

// Context to pass tab state between components
const TabsContext = React.createContext<{
  activeTab: string
  onTabChange: (value: string) => void
} | null>(null)

// Enhanced Tabs component with context
const TabsWithContext = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || '')

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = React.useCallback((newValue: string) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div
        ref={ref}
        className={`w-full ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
})

export { TabsWithContext as Tabs, TabsContent, TabsList, TabsTrigger }
