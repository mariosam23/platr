import React from 'react';

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    error?: string;
}

export const AuthField: React.FC<AuthFieldProps> = ({ id, label, error, ...inputProps }) => (
    <div className="auth-field">
        <label htmlFor={id}>{label}</label>
        <input id={id} {...inputProps} />
        {error ? (
            <p role="alert" className="auth-field-error">
                {error}
            </p>
        ) : null}
    </div>
);