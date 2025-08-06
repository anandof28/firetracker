export interface MaturedFD {
  id: string
  amount: number
  rate: number
  startDate: string
  endDate: string
  account: {
    name: string
  }
  daysPastMaturity: number
}

export interface ApproachingMaturityFD {
  id: string
  amount: number
  rate: number
  startDate: string
  endDate: string
  account: {
    name: string
  }
  daysUntilMaturity: number
}

export const getMaturedFDs = (fds: any[]): MaturedFD[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
  
  return fds
    .filter(fd => {
      const maturityDate = new Date(fd.endDate)
      maturityDate.setHours(0, 0, 0, 0)
      return maturityDate <= today
    })
    .map(fd => {
      const maturityDate = new Date(fd.endDate)
      maturityDate.setHours(0, 0, 0, 0)
      const daysPastMaturity = Math.floor((today.getTime() - maturityDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...fd,
        daysPastMaturity
      }
    })
    .sort((a, b) => b.daysPastMaturity - a.daysPastMaturity) // Sort by most overdue first
}

export const getApproachingMaturityFDs = (fds: any[], daysAhead: number = 45): ApproachingMaturityFD[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
  
  const futureDate = new Date(today)
  futureDate.setDate(today.getDate() + daysAhead)
  
  return fds
    .filter(fd => {
      const maturityDate = new Date(fd.endDate)
      maturityDate.setHours(0, 0, 0, 0)
      return maturityDate > today && maturityDate <= futureDate
    })
    .map(fd => {
      const maturityDate = new Date(fd.endDate)
      maturityDate.setHours(0, 0, 0, 0)
      const daysUntilMaturity = Math.floor((maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...fd,
        daysUntilMaturity
      }
    })
    .sort((a, b) => a.daysUntilMaturity - b.daysUntilMaturity) // Sort by soonest first
}

export const calculateMaturityAmount = (amount: number, rate: number, startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return amount * Math.pow(1 + rate / 100, diffYears)
}
