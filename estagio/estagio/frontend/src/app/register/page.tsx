"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerEstudante, registerEmpresa } from '@/services/authService';
import styles from './register.module.css';

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

export default function RegisterPage() {
    const [userType, setUserType] = useState('estudante');
    
    // Campos comuns
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    
    // Campos específicos
    const [cpf, setCpf] = useState('');
    const [curso, setCurso] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [endereco, setEndereco] = useState('');
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (userType === 'estudante') {
                await registerEstudante({
                    nome,
                    cpf,
                    curso,
                    email,
                    telefone,
                    senha,
                });
            } else {
                await registerEmpresa({
                    nome,
                    cnpj,
                    email,
                    telefone,
                    endereco,
                    senha,
                });
            }
            
            router.push('/login');
        } catch (err: any) {
            // Melhor tratamento de erro do backend
            const errorMsg = err.response?.data?.message 
                || err.response?.data?.error 
                || err.message 
                || 'Falha ao registrar. Tente novamente.';
            setError(errorMsg);
            console.error('Erro completo:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Cadastro</h1>
                    <p className={styles.subtitle}>Portal de Estágios Mackenzie</p>
                </header>

                <form onSubmit={handleRegister} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="userType" className={styles.inputLabel}>
                            Tipo de Cadastro
                        </label>
                        <div className={styles.selectWrapper}>
                            <select
                                id="userType"
                                name="userType"
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className={styles.selectField}
                            >
                                <option value="estudante">🎓 Estudante</option>
                                <option value="empresa">🏢 Empresa</option>
                            </select>
                            <div className={styles.selectIcon}>▼</div>
                        </div>
                    </div>

                    <Input id="nome" label="Nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input id="telefone" label="Telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />

                    {userType === 'estudante' ? (
                        <>
                            <Input id="cpf" label="CPF" type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                            <Input id="curso" label="Curso" type="text" value={curso} onChange={(e) => setCurso(e.target.value)} required />
                        </>
                    ) : (
                        <>
                            <Input id="cnpj" label="CNPJ" type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
                            <Input id="endereco" label="Endereço" type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required />
                        </>
                    )}

                    <Input id="senha" label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                        {loading ? (
                            <>
                                <span className={styles.buttonText}>Cadastrar</span>
                                <div className={styles.spinner}></div>
                            </>
                        ) : (
                            'Cadastrar'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <Link href="/login" className={styles.footerLink}>
                        Já tem conta? Faça login
                    </Link>
                </div>
            </div>
        </div>
    );
}
