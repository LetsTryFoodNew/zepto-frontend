// src/constants/statusMapping.tsx
import React from 'react';

export const statusTextMap: Record<string, string> = {
  RELEASED: 'Released',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  LOCKED: 'ASN Created',
  // Add other statuses as needed
};

export const statusBgColorMap: Record<string, string> = {
  RELEASED: '#a4abddff',   
  CANCELLED: 'rgba(255, 106, 106, 1)',  
  EXPIRED: '#fbff8bff',     
  LOCKED: '#99f091ff',     
  // Add colors for other statuses
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const text = statusTextMap[status] || status;
  const bgColor = statusBgColorMap[status] || '#e2e8f0'; // fallback light gray

  return (
    <span
      style={{
        backgroundColor: bgColor,
        color: '#1a202c',
        padding: '4px 10px',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: 14,
        display: 'inline-block',
        minWidth: 90,
        textAlign: 'center',
      }}
    >
      {text}
    </span>
  );
};

export default StatusBadge;
