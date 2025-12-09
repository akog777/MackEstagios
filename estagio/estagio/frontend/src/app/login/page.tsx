"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/services/authService';
import styles from './login.module.css';

interface InputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Input = ({ id, label, type, value, onChange, required = false }: InputProps) => (
    <div className={styles.inputGroup}>
        <label htmlFor={id} className={styles.inputLabel}>
            {label}
        </label>
        <div className={styles.inputWrapper}>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className={styles.inputField}
                placeholder={`Digite seu ${label.toLowerCase()}`}
            />
        </div>
    </div>
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('estudante');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { token, user } = await login({ email, senha: password, role });

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            router.push('/dashboard');
        } catch (err) {
            setError('Falha ao fazer login. Verifique suas credenciais.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        Entrar
                    </h1>
                    <p className={styles.subtitle}>Portal de Estágios Mackenzie</p>
                </header>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="role" className={styles.inputLabel}>
                            Tipo de Usuário
                        </label>
                        <div className={styles.selectWrapper}>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className={styles.selectField}
                            >
                                <option value="estudante">🎓 Estudante</option>
                                <option value="empresa">🏢 Empresa</option>
                                <option value="admin">⚙️ Administrador</option>
                            </select>
                            <div className={styles.selectIcon}>▼</div>
                        </div>
                    </div>

                    <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input id="password" label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                        {loading ? (
                            <>
                                <span className={styles.buttonText}>Entrar</span>
                                <div className={styles.spinner}></div>
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link href="/register" className={styles.footerLink}>
                        Criar conta
                    </Link>
                </div>
            </div>
        </div>
    );
}
