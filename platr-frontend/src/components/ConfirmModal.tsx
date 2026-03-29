import React from 'react';

interface ConfirmModalProps {
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    ariaLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    message,
    onConfirm,
    onCancel,
    isLoading = false,
    ariaLabel = 'Delete confirmation',
}) => (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <div className="modal-dialog modal-dialog--compact">
            <p className="modal-copy">{message}</p>
            <div className="modal-actions">
                <button type="button" className="app-button app-button-subtle" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </button>
                <button
                    type="button"
                    className="app-button app-button-danger"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
            </div>
        </div>
    </div>
);