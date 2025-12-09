'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './minhas-avaliacoes.module.css';

interface Avaliacao {
    id: number;
    nota: number;
    comentario: string;
    dataAvaliacao: string;
    vaga: {
        id: number;
        titulo: string;
        empresa: { nome: string };
    };
}

export default function MinhasAvaliacoesPage() {
    const router = useRouter();
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [media, setMedia] = useState(0);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchAvaliacoes = async () => {
            try {
                const userObj = JSON.parse(user);
                const token = localStorage.getItem('token');

                const response = await fetch(`/api/avaliacoes/estudante/${userObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar avaliações');
                }

                const data = await response.json();
                const avaliacoesArray = Array.isArray(data) ? data : [];
                setAvaliacoes(avaliacoesArray);

                // Calcular média
                if (avaliacoesArray.length > 0) {
                    const mediaCalculada =
                        avaliacoesArray.reduce((acc: number, av: Avaliacao) => acc + av.nota, 0) /
                        avaliacoesArray.length;
                    setMedia(mediaCalculada);
                }
            } catch (err) {
                setError('Erro ao carregar suas avaliações');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvaliacoes();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>
                <p>Carregando suas avaliações...</p>
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
                <h1>Minhas Avaliações</h1>
                <p className={styles.subtitle}>Total de {avaliacoes.length} avaliação(ões)</p>
            </div>

            {avaliacoes.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyIcon}>⭐</p>
                    <h2>Nenhuma avaliação encontrada</h2>
                    <p>Você ainda não fez nenhuma avaliação.</p>
                    <Link href="/vagas" className={styles.actionBtn}>
                        Explorar Vagas e Avaliar
                    </Link>
                </div>
            ) : (
                <>
                    <div className={styles.statsBox}>
                        <div className={styles.stat}>
                            <div className={styles.statLabel}>Média Geral</div>
                            <div className={styles.statValue}>{media.toFixed(1)}</div>
                            <div className={styles.statStars}>
                                {'⭐'.repeat(Math.round(media))}
                            </div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statLabel}>Total de Avaliações</div>
                            <div className={styles.statValue}>{avaliacoes.length}</div>
                        </div>
                    </div>

                    <div className={styles.avaliacoesList}>
                        {avaliacoes.map((avaliacao) => (
                            <div key={avaliacao.id} className={styles.avaliacaoCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.titleSection}>
                                        <h3 className={styles.vagaTitulo}>
                                            {avaliacao.vaga.titulo}
                                        </h3>
                                        <p className={styles.empresa}>
                                            {avaliacao.vaga.empresa?.nome || 'Empresa desconhecida'}
                                        </p>
                                    </div>
                                    <div className={styles.notaBox}>
                                        <div className={styles.notaValor}>{avaliacao.nota}</div>
                                        <div className={styles.notaEstrelas}>
                                            {'⭐'.repeat(avaliacao.nota)}
                                        </div>
                                    </div>
                                </div>

                                {avaliacao.comentario && (
                                    <div className={styles.cardBody}>
                                        <p className={styles.comentario}>
                                            "{avaliacao.comentario}"
                                        </p>
                                    </div>
                                )}

                                <div className={styles.cardFooter}>
                                    <small className={styles.data}>
                                        {new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')} às{' '}
                                        {new Date(avaliacao.dataAvaliacao).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </small>
                                    <Link
                                        href={`/vaga/${avaliacao.vaga.id}`}
                                        className={styles.detailsBtn}
                                    >
                                        Ver Vaga
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
