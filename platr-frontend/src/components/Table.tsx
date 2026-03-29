import React from 'react';

interface TableProps {
    children: React.ReactNode;
    isDimmed?: boolean;
    containerStyle?: React.CSSProperties;
    tableStyle?: React.CSSProperties;
}

export const tableHeaderStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    opacity: 0.65,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
};

export const tableCellStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    verticalAlign: 'middle',
};

export const Table: React.FC<TableProps> = ({
    children,
    isDimmed = false,
    containerStyle,
    tableStyle,
}) => (
    <div
        style={{
            overflowX: 'auto',
            opacity: isDimmed ? 0.6 : 1,
            transition: 'opacity 0.15s',
            ...containerStyle,
        }}
    >
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.95rem',
                ...tableStyle,
            }}
        >
            {children}
        </table>
    </div>
);