import React from 'react';

interface TableProps {
    children: React.ReactNode;
    isDimmed?: boolean;
    containerStyle?: React.CSSProperties;
    tableStyle?: React.CSSProperties;
}

export const tableHeaderStyle: React.CSSProperties = {
};

export const tableCellStyle: React.CSSProperties = {
};

export const Table: React.FC<TableProps> = ({
    children,
    isDimmed = false,
    containerStyle,
    tableStyle,
}) => (
    <div
        className={`data-table-shell${isDimmed ? ' is-dimmed' : ''}`}
        style={{
            ...containerStyle,
        }}
    >
        <table
            className="data-table"
            style={{
                ...tableStyle,
            }}
        >
            {children}
        </table>
    </div>
);