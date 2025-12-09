'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './minhas-inscricoes.module.css';

interface Inscricao {
    id: number;
    status: string;
    dataCandidatura: string;
    vaga: {
        id: number;
        titulo: string;
        empresa: { nome: string };
        localizacao: string;
    };
}

export default function MinhasInscricoesPage() {
    const router = useRouter();
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchInscricoes = async () => {
            try {
                const userObj = JSON.parse(user);
                const token = localStorage.getItem('token');

                const response = await fetch(`/api/inscricoes/estudante/${userObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar inscrições');
                }

                const data = await response.json();
                setInscricoes(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Erro ao carregar suas inscrições');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInscricoes();
    }, [router]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'aprovado':
                return styles.statusAprovado;
            case 'rejeitado':
                return styles.statusRejeitado;
            case 'pendente':
                return styles.statusPendente;
            default:
                return '';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'aprovado':
                return '✅';
            case 'rejeitado':
                return '❌';
            case 'pendente':
                return '⏳';
            default:
                return '📋';
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>
                <p>Carregando suas inscrições...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>

            <div className={styles.header}>
                <h1>Minhas Inscrições</h1>
                <p className={styles.subtitle}>Total de {inscricoes.length} inscrição(ões)</p>
            </div>

            {inscricoes.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyIcon}>📭</p>
                    <h2>Nenhuma inscrição encontrada</h2>
                    <p>Você ainda não se inscreveu em nenhuma vaga.</p>
                    <Link href="/vagas" className={styles.actionBtn}>
                        Explorar Vagas
                    </Link>
                </div>
            ) : (
                <div className={styles.inscricoesList}>
                    {inscricoes.map((inscricao) => (
                        <div key={inscricao.id} className={styles.inscricaoCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.titleSection}>
                                    <h3 className={styles.vagaTitulo}>
                                        {inscricao.vaga.titulo}
                                    </h3>
                                    <p className={styles.empresa}>
                                        {inscricao.vaga.empresa?.nome || 'Empresa desconhecida'}
                                    </p>
                                </div>
                                <div className={`${styles.status} ${getStatusColor(inscricao.status)}`}>
                                    <span className={styles.statusIcon}>
                                        {getStatusIcon(inscricao.status)}
                                    </span>
                                    <span className={styles.statusText}>
                                        {inscricao.status || 'Pendente'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>📍 Localização:</span>
                                    <span className={styles.value}>
                                        {inscricao.vaga.localizacao || 'Não informado'}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>📅 Data da candidatura:</span>
                                    <span className={styles.value}>
                                        {new Date(inscricao.dataCandidatura).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <Link
                                    href={`/vaga/${inscricao.vaga.id}`}
                                    className={styles.detailsBtn}
                                >
                                    Ver Detalhes da Vaga
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
