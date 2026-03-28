import React from 'react';
import { modalBaseStyle, overlayStyle } from './recipeStyles';

interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    message,
    onConfirm,
    onCancel,
    isLoading,
}) => (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Delete recipe confirmation">
        <div style={{ ...modalBaseStyle, maxWidth: 420 }}>
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
                    {isLoading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);