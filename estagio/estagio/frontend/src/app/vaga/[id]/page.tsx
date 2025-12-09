'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './vaga.module.css';

interface Avaliacao {
    id: number;
    nota: number;
    comentario: string;
    estudante: { nome: string };
    dataAvaliacao: string;
}

interface Vaga {
    id: number;
    titulo: string;
    descricao: string;
    localizacao: string;
    modalidade: string;
    cargaHoraria: number;
    requisitos: string;
    empresa: { id: number; nome: string };
    aberta: boolean;
}

export default function VagaDetalhePage() {
    const params = useParams();
    const vagaId = params.id as string;
    const router = useRouter();

    const [vaga, setVaga] = useState<Vaga | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [media, setMedia] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nota, setNota] = useState(5);
    const [comentario, setComentario] = useState('');
    const [avaliando, setAvaliando] = useState(false);

    const [jaInscrito, setJaInscrito] = useState(false);
    const [inscrevendo, setInscrevendo] = useState(false);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchVagaEAvaliacoes = async () => {
            try {
                const userObj = JSON.parse(user);
                setUser(userObj);
                
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/vagas-estagio/${vagaId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const vagaData = await response.json();
                setVaga(vagaData);

                const statsResponse = await fetch(`/api/avaliacoes/vaga/${vagaId}/estatisticas`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResponse.json();
                setAvaliacoes(statsData.avaliacoes);
                setMedia(statsData.mediaNotas || 0);

                if (userObj.role === 'estudante') {
                    const inscricoesResponse = await fetch(`/api/inscricoes/estudante/${userObj.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const inscricoes = await inscricoesResponse.json();
                    const jainscrito = inscricoes.some((insc: any) => insc.vaga.id === parseInt(vagaId));
                    setJaInscrito(jainscrito);
                }
            } catch (err) {
                setError('Erro ao carregar vaga');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVagaEAvaliacoes();
    }, [vagaId, router]);

    const handleInscricao = async () => {
        if (jaInscrito) {
            alert('Você já está inscrito nesta vaga!');
            return;
        }

        setInscrevendo(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');
            const response = await fetch('/api/inscricoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    estudante: { id: user.id },
                    vaga: { id: parseInt(vagaId) }
                })
            });

            if (response.ok) {
                setJaInscrito(true);
                alert('Inscrição realizada com sucesso! 🎉');
            } else {
                const errData = await response.json();
                alert(`Erro ao se inscrever: ${errData.message || 'Tente novamente'}`);
            }
        } catch (err) {
            alert('Erro ao se inscrever na vaga');
            console.error(err);
        } finally {
            setInscrevendo(false);
        }
    };

    const handleAvaliacao = async (e: React.FormEvent) => {
        e.preventDefault();
        setAvaliando(true);

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');
            const response = await fetch('/api/avaliacoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    estudante: { id: user.id },
                    vaga: { id: parseInt(vagaId) },
                    nota,
                    comentario
                })
            });

            if (response.ok) {
                setNota(5);
                setComentario('');
                const statsResponse = await fetch(`/api/avaliacoes/vaga/${vagaId}/estatisticas`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResponse.json();
                setAvaliacoes(statsData.avaliacoes);
                setMedia(statsData.mediaNotas || 0);
                alert('Avaliação enviada com sucesso! ⭐');
            } else {
                alert('Erro ao enviar avaliação');
            }
        } catch (err) {
            alert('Erro ao enviar avaliação');
            console.error(err);
        } finally {
            setAvaliando(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Carregando...</p></div>;
    if (error || !vaga) return <div className={styles.container}><p className={styles.error}>{error || 'Vaga não encontrada'}</p></div>;

    return (
        <div className={styles.container}>
            <Link href={user?.role === 'empresa' ? '/minhas-vagas' : '/vagas'} className={styles.backBtn}>
                ← Voltar
            </Link>

            <div className={styles.vagaDetalhes}>
                <h1 className={styles.titulo}>{vaga.titulo || 'Vaga sem título'}</h1>
                {vaga.empresa && (
                    <div className={styles.empresa}>
                        <strong>Empresa:</strong> {vaga.empresa.nome}
                    </div>
                )}

                <div className={styles.infoGrid}>
                    {vaga.localizacao && (
                        <div className={styles.infoItem}>
                            <strong>📍 Local:</strong> {vaga.localizacao}
                        </div>
                    )}
                    {vaga.modalidade && (
                        <div className={styles.infoItem}>
                            <strong>🏢 Modalidade:</strong> {vaga.modalidade}
                        </div>
                    )}
                    {vaga.cargaHoraria > 0 && (
                        <div className={styles.infoItem}>
                            <strong>⏰ Carga Horária:</strong> {vaga.cargaHoraria}h/semana
                        </div>
                    )}
                    {vaga.requisitos && (
                        <div className={styles.infoItem}>
                            <strong>📋 Requisitos:</strong> {vaga.requisitos}
                        </div>
                    )}
                </div>

                <div className={styles.descricaoBox}>
                    <h3>Descrição</h3>
                    <p>{vaga.descricao || 'Sem descrição disponível'}</p>
                </div>

                {user && user.role === 'estudante' && (
                    <div className={styles.acaoBox}>
                        {jaInscrito ? (
                            <div className={styles.jaInscrito}>
                                <p>✅ Você já está inscrito nesta vaga</p>
                            </div>
                        ) : (
                            <button
                                onClick={handleInscricao}
                                disabled={inscrevendo}
                                className={styles.inscreverBtn}
                            >
                                {inscrevendo ? 'Inscrevendo...' : '📝 Se Inscrever Nesta Vaga'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.avaliacoesContainer}>
                <div className={styles.avaliacoesTitulo}>
                    <h2>Avaliações de Ex-Estagiários</h2>
                    <div className={styles.mediaBox}>
                        <div className={styles.nota}>{media.toFixed(1)}</div>
                        <div className={styles.stars}>
                            {'⭐'.repeat(Math.round(media))}
                        </div>
                        <small>{avaliacoes.length} avaliações</small>
                    </div>
                </div>

                {user && user.role === 'estudante' && (
                    <form onSubmit={handleAvaliacao} className={styles.avaliacaoForm}>
                        <h3>Deixe sua avaliação</h3>
                        
                        <div className={styles.inputGroup}>
                            <label>Nota (1-5 estrelas)</label>
                            <div className={styles.notaInput}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        className={`${styles.estrela} ${nota >= n ? styles.ativo : ''}`}
                                        onClick={() => setNota(n)}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="comentario">Comentário (opcional)</label>
                            <textarea
                                id="comentario"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                placeholder="Compartilhe sua experiência..."
                                maxLength={500}
                                rows={4}
                                className={styles.textarea}
                            />
                            <small>{comentario.length}/500</small>
                        </div>

                        <button type="submit" disabled={avaliando} className={styles.submitBtn}>
                            {avaliando ? 'Enviando...' : 'Enviar Avaliação'}
                        </button>
                    </form>
                )}

                <div className={styles.avaliacoesList}>
                    {avaliacoes.length === 0 ? (
                        <p className={styles.noAvaliacoes}>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                    ) : (
                        avaliacoes.map((av) => (
                            <div key={av.id} className={styles.avaliacaoItem}>
                                <div className={styles.avaliacaoHeader}>
                                    <strong>{av.estudante.nome}</strong>
                                    <div className={styles.nota_estrelas}>
                                        {'⭐'.repeat(av.nota)}
                                        <span className={styles.notaNumero}>({av.nota}/5)</span>
                                    </div>
                                </div>
                                <p className={styles.comentario_text}>{av.comentario}</p>
                                <small className={styles.data}>
                                    {new Date(av.dataAvaliacao).toLocaleDateString('pt-BR')}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}