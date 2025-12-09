'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './minhas-vagas.module.css';

interface Vaga {
    id: number;
    titulo: string;
    descricao: string;
    localizacao: string;
    modalidade: string;
    cargaHoraria: number;
    requisitos: string;
    aberta: boolean;
}

export default function MinhasVagasPage() {
    const router = useRouter();
    const [vagas, setVagas] = useState<Vaga[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        const userObj = JSON.parse(user);
        if (userObj.role !== 'empresa') {
            router.push('/dashboard');
            return;
        }

        const fetchVagas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/vagas-estagio/empresa/${userObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar vagas');
                }

                const data = await response.json();
                setVagas(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Erro ao carregar suas vagas');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVagas();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>
                <p>Carregando suas vagas...</p>
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
                <h1>Minhas Vagas</h1>
                <Link href="/criar-vaga" className={styles.criarBtn}>
                    ➕ Criar Nova Vaga
                </Link>
            </div>

            {vagas.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyIcon}>📋</p>
                    <h2>Nenhuma vaga publicada</h2>
                    <p>Você ainda não publicou nenhuma vaga. Crie sua primeira vaga agora!</p>
                    <Link href="/criar-vaga" className={styles.actionBtn}>
                        ➕ Criar Vaga
                    </Link>
                </div>
            ) : (
                <div className={styles.vagasList}>
                    {vagas.map((vaga) => (
                        <div key={vaga.id} className={styles.vagaCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.titleSection}>
                                    <h3 className={styles.vagaTitulo}>{vaga.titulo}</h3>
                                    <div className={styles.statusBadge}>
                                        {vaga.aberta ? (
                                            <span className={styles.statusAberta}>✅ Aberta</span>
                                        ) : (
                                            <span className={styles.statusEncerrada}>❌ Encerrada</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <p className={styles.descricao}>{vaga.descricao}</p>
                                <div className={styles.infoGrid}>
                                    {vaga.localizacao && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>📍 Local:</span>
                                            <span className={styles.value}>{vaga.localizacao}</span>
                                        </div>
                                    )}
                                    {vaga.modalidade && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>🏢 Modalidade:</span>
                                            <span className={styles.value}>{vaga.modalidade}</span>
                                        </div>
                                    )}
                                    {vaga.cargaHoraria > 0 && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>⏰ Carga Horária:</span>
                                            <span className={styles.value}>{vaga.cargaHoraria}h/semana</span>
                                        </div>
                                    )}
                                    {vaga.requisitos && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>📋 Requisitos:</span>
                                            <span className={styles.value}>{vaga.requisitos}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <Link
                                    href={`/vaga/${vaga.id}`}
                                    className={styles.viewBtn}
                                >
                                    Ver Detalhes
                                </Link>
                                <Link
                                    href={`/inscricoes-vagas?vagaId=${vaga.id}`}
                                    className={styles.inscricoesBtn}
                                >
                                    👥 Inscrições ({0})
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
