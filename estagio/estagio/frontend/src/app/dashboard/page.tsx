'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

interface User {
    id: number;
    nome: string;
    role: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userStr || !token) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/');
    };

    if (loading) return <div className={styles.container}><p>Carregando...</p></div>;
    if (!user) return null;

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <h1 className={styles.logo}>🎓 Portal de Estágios</h1>
                <div className={styles.userInfo}>
                    <span>Bem-vindo, <strong>{user.nome}</strong></span>
                    <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.welcomeBox}>
                    <h2>Bem-vindo ao Portal de Estágios!</h2>
                    <p>Escolha uma opção abaixo para continuar:</p>
                </div>

                {user.role === 'estudante' && (
                    <div className={styles.optionsGrid}>
                        <Link href="/vagas" className={styles.optionCard}>
                            <div className={styles.icon}>🔍</div>
                            <h3>Explorar Vagas</h3>
                            <p>Veja todas as vagas disponíveis e suas avaliações</p>
                        </Link>

                        <Link href="/minhas-inscricoes" className={styles.optionCard}>
                            <div className={styles.icon}>📝</div>
                            <h3>Minhas Inscrições</h3>
                            <p>Acompanhe suas candidaturas</p>
                        </Link>

                        <Link href="/minhas-avaliacoes" className={styles.optionCard}>
                            <div className={styles.icon}>⭐</div>
                            <h3>Minhas Avaliações</h3>
                            <p>Veja as avaliações que você fez</p>
                        </Link>

                        <Link href="/meu-perfil" className={styles.optionCard}>
                            <div className={styles.icon}>👤</div>
                            <h3>Meu Perfil</h3>
                            <p>Edite suas informações e áreas de interesse</p>
                        </Link>
                    </div>
                )}

                {user.role === 'empresa' && (
                    <div className={styles.optionsGrid}>
                        <Link href="/minhas-vagas" className={styles.optionCard}>
                            <div className={styles.icon}>📋</div>
                            <h3>Minhas Vagas</h3>
                            <p>Gerencie suas vagas de estágio</p>
                        </Link>

                        <Link href="/criar-vaga" className={styles.optionCard}>
                            <div className={styles.icon}>➕</div>
                            <h3>Criar Vaga</h3>
                            <p>Publique uma nova vaga de estágio</p>
                        </Link>

                        <Link href="/inscricoes-vagas" className={styles.optionCard}>
                            <div className={styles.icon}>👥</div>
                            <h3>Inscrições Recebidas</h3>
                            <p>Veja candidatos inscritos nas suas vagas</p>
                        </Link>

                        <Link href="/meu-perfil-empresa" className={styles.optionCard}>
                            <div className={styles.icon}>🏢</div>
                            <h3>Perfil da Empresa</h3>
                            <p>Edite informações da empresa</p>
                        </Link>
                    </div>
                )}

                {user.role === 'admin' && (
                    <div className={styles.optionsGrid}>
                        <Link href="/admin-stats" className={styles.optionCard}>
                            <div className={styles.icon}>📊</div>
                            <h3>Estatísticas</h3>
                            <p>Visualize dados do portal</p>
                        </Link>

                        <Link href="/admin-areas" className={styles.optionCard}>
                            <div className={styles.icon}>🏷️</div>
                            <h3>Gerenciar Áreas</h3>
                            <p>CRUD de áreas de interesse</p>
                        </Link>

                        <Link href="/admin-usuarios" className={styles.optionCard}>
                            <div className={styles.icon}>👥</div>
                            <h3>Usuários</h3>
                            <p>Gerencie estudantes e empresas</p>
                        </Link>

                        <Link href="/admin-vagas" className={styles.optionCard}>
                            <div className={styles.icon}>💼</div>
                            <h3>Vagas</h3>
                            <p>Monitore todas as vagas do sistema</p>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
