import React from 'react';

interface ConfirmModalProps {
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    ariaLabel?: string;
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
    background: '#1e1e1e',
    borderRadius: 10,
    padding: '2rem',
    width: '90%',
    maxWidth: 420,
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    message,
    onConfirm,
    onCancel,
    isLoading = false,
    ariaLabel = 'Delete confirmation',
}) => (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <div style={modalStyle}>
            <p style={{ margin: '0 0 1.5rem', lineHeight: 1.6 }}>{message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    style={{
                        background: '#7f1d1d',
                        color: '#fca5a5',
                        borderColor: '#ef4444',
                    }}
                >
                    {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
            </div>
        </div>
    </div>
);