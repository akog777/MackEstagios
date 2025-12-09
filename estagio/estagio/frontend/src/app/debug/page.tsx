"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './debug.module.css';

export default function DebugPage() {
    const [storage, setStorage] = useState<Record<string, string>>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const s: Record<string, string> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    s[key] = localStorage.getItem(key) || '';
                }
            }
            setStorage(s);
        }
    }, []);

    const handleClearStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            setStorage({});
            alert('localStorage limpo!');
        }
    };

    const handleRemoveItem = (key: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
            setStorage(prev => {
                const newS = { ...prev };
                delete newS[key];
                return newS;
            });
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>🔧 Debug Page</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <Link href="/" style={{ marginRight: '10px' }}>Home</Link>
                <Link href="/register" style={{ marginRight: '10px' }}>Register</Link>
                <Link href="/login">Login</Link>
            </div>

            <h2>📦 localStorage Contents:</h2>
            <div style={{ 
                backgroundColor: '#f0f0f0', 
                padding: '10px', 
                borderRadius: '5px',
                marginBottom: '20px',
                maxHeight: '200px',
                overflow: 'auto'
            }}>
                {Object.keys(storage).length === 0 ? (
                    <p>localStorage está vazio</p>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Chave</th>
                                <th>Valor</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(storage).map(([key, value]) => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{value.substring(0, 50)}{value.length > 50 ? '...' : ''}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleRemoveItem(key)}
                                            style={{ 
                                                padding: '5px 10px',
                                                backgroundColor: '#ff4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <button
                onClick={handleClearStorage}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#ff0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginBottom: '20px'
                }}
            >
                🗑️ Limpar localStorage completamente
            </button>

            <h2>💡 Instruções:</h2>
            <ul>
                <li>Se estiver recebendo erro 403, clique em "Limpar localStorage completamente"</li>
                <li>Isso remove tokens inválidos/expirados</li>
                <li>Depois tente se registrar ou fazer login novamente</li>
            </ul>

            <h2>🔗 Links Rápidos:</h2>
            <ul>
                <li><Link href="/register">Registrar novo usuário</Link></li>
                <li><Link href="/login">Fazer Login</Link></li>
                <li><Link href="/vagas">Explorar Vagas</Link></li>
            </ul>
        </div>
    );
}
