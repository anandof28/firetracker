import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  onButtonClick: () => void;
  buttonColor?: 'primary' | 'secondary' | 'accent';
}

export default function PageHeader({
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick,
  buttonColor = 'primary'
}: PageHeaderProps) {
  // Using design tokens - soft, accessible colors
  const colorStyles = {
    primary: {
      background: '#7BAACF',
      hover: '#6AA0C8',
      text: '#FFFFFF',
      ring: 'rgba(123, 170, 207, 0.3)'
    },
    secondary: {
      background: '#E5B8A6',
      hover: '#DCA991',
      text: '#1F2937',
      ring: 'rgba(229, 184, 166, 0.3)'
    },
    accent: {
      background: '#A3C9A8',
      hover: '#93BB98',
      text: '#1F2937',
      ring: 'rgba(163, 201, 168, 0.3)'
    }
  };

  const colors = colorStyles[buttonColor];

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>{title}</h1>
        <p className="mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>{description}</p>
      </div>
      <button
        onClick={onButtonClick}
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          padding: '10px 16px',
          borderRadius: '10px',
          fontWeight: 500,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 180ms cubic-bezier(.2,.8,.2,1)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.hover;
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.background;
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.ring}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        }}
      >
        {buttonIcon || (
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
        {buttonText}
      </button>
    </div>
  );
}
