'use client'

import { formatDateForDisplay } from '@/utils/dateHelpers'
import { ApproachingMaturityFD, calculateMaturityAmount, MaturedFD } from '@/utils/fdUtils'
import Link from 'next/link'
import { useState } from 'react'

interface FDNotificationProps {
  maturedFDs: MaturedFD[]
  approachingMaturityFDs: ApproachingMaturityFD[]
}

export default function FDNotification({ maturedFDs, approachingMaturityFDs }: FDNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const hasMatured = maturedFDs.length > 0
  const hasApproaching = approachingMaturityFDs.length > 0
  const totalNotifications = maturedFDs.length + approachingMaturityFDs.length

  if (totalNotifications === 0 || isDismissed) return null

  // Use static classes to avoid Tailwind purging issues
  const notificationStyles = hasMatured ? {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    iconColor: 'text-gray-700',
    titleColor: 'text-gray-700',
    textColor: 'text-gray-700',
    buttonColor: 'text-gray-700 hover:text-gray-700',
    buttonIconColor: 'text-gray-700 hover:text-gray-700',
    sectionBg: 'bg-orange-100',
    sectionBorder: 'border-orange-200',
    sectionText: 'text-gray-700',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-gray-700',
    highlightText: 'text-gray-700'
  } : {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    iconColor: 'text-gray-700',
    titleColor: 'text-gray-700',
    textColor: 'text-gray-700',
    buttonColor: 'text-gray-700 hover:text-gray-700',
    buttonIconColor: 'text-gray-700 hover:text-gray-700',
    sectionBg: 'bg-yellow-100',
    sectionBorder: 'border-yellow-200',
    sectionText: 'text-gray-700',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-gray-700',
    highlightText: 'text-gray-700'
  }

  return (
    <div className={`${notificationStyles.bgColor} border-l-4 ${notificationStyles.borderColor} p-4 mb-6 rounded-r-lg`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {hasMatured ? (
            <svg className={`h-5 w-5 ${notificationStyles.iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={`h-5 w-5 ${notificationStyles.iconColor}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${notificationStyles.titleColor}`}>
                {hasMatured && hasApproaching ? (
                  `${maturedFDs.length} FD${maturedFDs.length > 1 ? 's' : ''} Overdue, ${approachingMaturityFDs.length} Approaching Maturity`
                ) : hasMatured ? (
                  `${maturedFDs.length} FD${maturedFDs.length > 1 ? 's' : ''} Due for Renewal`
                ) : (
                  `${approachingMaturityFDs.length} FD${approachingMaturityFDs.length > 1 ? 's' : ''} Approaching Maturity`
                )}
              </h3>
              <p className={`mt-1 text-sm ${notificationStyles.textColor}`}>
                {hasMatured && hasApproaching ? (
                  'Some FDs have matured and others are approaching maturity within 45 days.'
                ) : hasMatured ? (
                  'You have fixed deposits that have matured and need attention.'
                ) : (
                  'You have fixed deposits maturing within the next 45 days.'
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${notificationStyles.buttonColor} text-sm font-medium`}
              >
                {isExpanded ? 'Hide Details' : 'View Details'}
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className={notificationStyles.buttonIconColor}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4">
              <div className={`bg-white rounded-lg shadow-sm border ${notificationStyles.sectionBorder} overflow-hidden`}>
                {/* Matured FDs Section */}
                {hasMatured && (
                  <>
                    <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                      <h4 className="text-sm font-medium text-gray-700">
                        Overdue FDs ({maturedFDs.length})
                      </h4>
                    </div>
                    <div className="divide-y divide-red-100">
                      {maturedFDs.map((fd) => (
                        <div key={fd.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  ₹{fd.amount.toFixed(2)}
                                </span>
                                <span className="text-xs bg-red-100 text-gray-700 px-2 py-1 rounded">
                                  {fd.rate}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {fd.account.name}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-600">
                                Matured: {formatDateForDisplay(fd.endDate)}
                                <span className="text-gray-700 font-medium ml-2">
                                  ({fd.daysPastMaturity} day{fd.daysPastMaturity > 1 ? 's' : ''} overdue)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-700">
                                ₹{calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">Maturity Value</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Approaching Maturity FDs Section */}
                {hasApproaching && (
                  <>
                    <div className={`px-4 py-3 ${notificationStyles.sectionBg} border-b ${notificationStyles.sectionBorder} ${hasMatured ? 'border-t border-gray-300' : ''}`}>
                      <h4 className={`text-sm font-medium ${notificationStyles.sectionText}`}>
                        Approaching Maturity ({approachingMaturityFDs.length})
                      </h4>
                    </div>
                    <div className={`divide-y divide-gray-100`}>
                      {approachingMaturityFDs.map((fd) => (
                        <div key={fd.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  ₹{fd.amount.toFixed(2)}
                                </span>
                                <span className={`text-xs ${notificationStyles.badgeBg} ${notificationStyles.badgeText} px-2 py-1 rounded`}>
                                  {fd.rate}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {fd.account.name}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-600">
                                Matures: {formatDateForDisplay(fd.endDate)}
                                <span className={`${notificationStyles.highlightText} font-medium ml-2`}>
                                  (in {fd.daysUntilMaturity} day{fd.daysUntilMaturity > 1 ? 's' : ''})
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-700">
                                ₹{calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.endDate).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">Maturity Value</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className={`px-4 py-3 bg-gray-50 border-t ${notificationStyles.sectionBorder}`}>
                  <Link
                    href="/fds"
                    className={`text-sm font-medium ${notificationStyles.buttonColor}`}
                  >
                    View All FDs →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
