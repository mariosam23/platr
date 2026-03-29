import React from 'react';

interface TableProps {
    children: React.ReactNode;
    isDimmed?: boolean;
    tableStyle?: React.CSSProperties;
}

export const Table: React.FC<TableProps> = ({
    children,
    isDimmed = false,
    tableStyle,
}) => (
    <div className={`data-table-shell${isDimmed ? ' is-dimmed' : ''}`}>
        <table className="data-table" style={tableStyle}>
            {children}
        </table>
    </div>
);
