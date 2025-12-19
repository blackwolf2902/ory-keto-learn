import React from 'react';
import type { UiContainer, UiNode } from '@ory/client';

interface KratosFormProps {
    ui: UiContainer;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const KratosForm: React.FC<KratosFormProps> = ({ ui, onSubmit }) => {
    return (
        <form action={ui.action} method={ui.method} onSubmit={onSubmit}>
            {ui.nodes.map((node, index) => (
                <KratosNode key={index} node={node} />
            ))}
        </form>
    );
};

const KratosNode: React.FC<{ node: UiNode }> = ({ node }) => {
    const attributes = node.attributes as any;

    if (node.type === 'text') {
        return <div className="kratos-text">{node.messages.map(m => m.text).join(' ')}</div>;
    }

    const name = attributes.name;
    const label = node.meta?.label?.text;

    switch (attributes.node_type) {
        case 'input':
            if (attributes.type === 'submit') {
                return (
                    <button type="submit" name={name} value={attributes.value} className="kratos-button">
                        {label || attributes.value}
                    </button>
                );
            }
            return (
                <div className="kratos-input-group">
                    {label && <label htmlFor={name}>{label}</label>}
                    <input
                        id={name}
                        name={name}
                        type={attributes.type}
                        defaultValue={attributes.value}
                        disabled={attributes.disabled}
                        required={attributes.required}
                        className="kratos-input"
                    />
                    {node.messages.map((m, i) => (
                        <p key={i} className={`kratos-message ${m.type}`}>{m.text}</p>
                    ))}
                </div>
            );
        default:
            return null;
    }
};
