'use client';

import { useState } from 'react';

interface SensitiveSpanProps {
  type: string;
  risk: 'high' | 'medium';
  text: string;
}

// Format type names for display
function formatTypeName(type: string): string {
  const typeMap: { [key: string]: string } = {
    email: 'Email address',
    phone: 'Phone number',
    address: 'Physical address',
    payment_card: 'Payment card',
    bank_account: 'Bank account',
    routing_number: 'Routing number',
    government_id: 'Government ID',
    account_id: 'Account ID',
    order_id: 'Order ID',
    invoice_id: 'Invoice ID',
    tracking_id: 'Tracking number',
    transaction_id: 'Transaction ID',
    generic_id: 'Identifier',
    url: 'URL with sensitive data',
    token: 'Access token',
  };
  return typeMap[type] || 'Sensitive data';
}

export default function SensitiveSpan({ type, risk, text }: SensitiveSpanProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const underlineColor = risk === 'high' ? 'red' : 'orange';
  const riskLabel = risk === 'high' ? 'HIGH' : 'MEDIUM';
  const riskColor = risk === 'high' ? '#ef4444' : '#f59e0b';

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          textDecoration: 'underline',
          textDecorationColor: underlineColor,
          textDecorationThickness: '2px',
          cursor: 'help',
          position: 'relative',
        }}
      >
        {text}
      </span>

      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#fff',
            border: '1px solid #000',
            borderRadius: '2px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.85rem',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: '150px',
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#000' }}>
            {formatTypeName(type)}
          </div>
          <div style={{ fontSize: '0.75rem', color: riskColor, fontWeight: '600' }}>
            Risk: {riskLabel}
          </div>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #000',
            }}
          />
        </div>
      )}
    </>
  );
}