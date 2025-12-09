'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getVagas } from '@/services/authService';
import styles from './vagas.module.css';

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

export default function VagasPage() {
    const [vagas, setVagas] = useState<Vaga[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchVagas = async () => {
            try {
                const data = await getVagas();
                setVagas(data);
            } catch (err) {
                setError('Erro ao carregar vagas');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVagas();
    }, [router]);

    if (loading) return <div className={styles.container}><p>Carregando vagas...</p></div>;
    if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Vagas de Estágio</h1>
                <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>
            </header>

            {vagas.length === 0 ? (
                <p className={styles.noData}>Nenhuma vaga disponível no momento.</p>
            ) : (
                <div className={styles.vagasGrid}>
                    {vagas.map((vaga) => (
                        <div key={vaga.id} className={styles.vagaCard}>
                            <div className={styles.vagaHeader}>
                                <h2 className={styles.titulo}>{vaga.titulo}</h2>
                                <span className={`${styles.status} ${vaga.aberta ? styles.aberta : styles.encerrada}`}>
                                    {vaga.aberta ? '✓ Aberta' : '✗ Encerrada'}
                                </span>
                            </div>
                            <p className={styles.descricao}>{vaga.descricao}</p>
                            
                            <div className={styles.detalhes}>
                                <div className={styles.detalhe}>
                                    <strong>📍 Local:</strong> {vaga.localizacao}
                                </div>
                                <div className={styles.detalhe}>
                                    <strong>🏢 Modalidade:</strong> {vaga.modalidade}
                                </div>
                                <div className={styles.detalhe}>
                                    <strong>⏰ Carga Horária:</strong> {vaga.cargaHoraria}h/semana
                                </div>
                                <div className={styles.detalhe}>
                                    <strong>📋 Requisitos:</strong> {vaga.requisitos}
                                </div>
                            </div>

                            {vaga.aberta && (
                                <Link href={`/vaga/${vaga.id}`} className={styles.detalheBtn}>
                                    Ver Detalhes e Avaliar
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
