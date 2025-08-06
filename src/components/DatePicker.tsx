'use client'

import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface CustomDatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
  showTimeSelect?: boolean
  dateFormat?: string
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  placeholder = "Select date",
  className = "",
  required = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = "dd/MM/yyyy"
}) => {
  const baseClassName = "w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  
  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholder}
        className={`${baseClassName} ${className}`}
        required={required}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        dateFormat={dateFormat}
        autoComplete="off"
        showPopperArrow={false}
        popperClassName="z-50"
        calendarClassName="!font-sans"
        dayClassName={(date) => 
          "hover:bg-blue-500 hover:text-white rounded-md transition-colors duration-200"
        }
        weekDayClassName={() => "text-gray-600 font-medium"}
        monthClassName={() => "text-gray-800"}
        timeClassName={() => "text-gray-800"}
        customInput={
          <input
            className={`${baseClassName} ${className}`}
            placeholder={placeholder}
            required={required}
          />
        }
      />
      
      {/* Custom styles */}
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        
        .react-datepicker__header {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
        }
        
        .react-datepicker__current-month {
          color: #1f2937 !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-weight: 500 !important;
        }
        
        .react-datepicker__day {
          color: #374151 !important;
          border-radius: 0.375rem !important;
          transition: all 0.2s ease-in-out !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .react-datepicker__day--selected {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #dbeafe !important;
          color: #1d4ed8 !important;
        }
        
        .react-datepicker__day--today {
          background-color: #fef3c7 !important;
          color: #92400e !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--outside-month {
          color: #d1d5db !important;
        }
        
        .react-datepicker__navigation {
          top: 13px !important;
        }
        
        .react-datepicker__navigation--previous {
          border-right-color: #6b7280 !important;
        }
        
        .react-datepicker__navigation--next {
          border-left-color: #6b7280 !important;
        }
        
        .react-datepicker__navigation:hover *::before {
          border-color: #3b82f6 !important;
        }
        
        .react-datepicker__triangle {
          display: none !important;
        }
        
        .react-datepicker-popper {
          z-index: 50 !important;
        }
        
        .react-datepicker__time-container {
          border-left: 1px solid #e5e7eb !important;
        }
        
        .react-datepicker__time-list-item {
          transition: all 0.2s ease-in-out !important;
        }
        
        .react-datepicker__time-list-item:hover {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .react-datepicker__time-list-item--selected {
          background-color: #2563eb !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}

export default CustomDatePicker
