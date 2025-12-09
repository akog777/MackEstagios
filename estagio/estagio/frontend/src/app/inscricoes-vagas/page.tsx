'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './inscricoes-vagas.module.css';

interface Estudante {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  curso: string;
}

interface Inscricao {
  id: number;
  estudante: Estudante;
  dataInscricao: string;
  status: 'APROVADO' | 'REJEITADO' | 'PENDENTE';
}

interface Vaga {
  id: number;
  titulo: string;
  empresa?: { id: number };
  aberta: boolean;
}

interface VagaComInscricoes {
  vaga: Vaga;
  inscricoes: Inscricao[];
}

export default function InscricoesVagas() {
  const router = useRouter();
  const [vagasComInscricoes, setVagasComInscricoes] = useState<VagaComInscricoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'empresa') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchInscricoes(parsedUser);
  }, [router]);

  const fetchInscricoes = async (userData: any) => {
    try {
      const token = localStorage.getItem('token');

      // Fetch vagas da empresa
      const vagasResponse = await fetch(`/api/vagas-estagio/empresa/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!vagasResponse.ok) {
        throw new Error('Erro ao carregar vagas');
      }

      const vagas = await vagasResponse.json();

      // Fetch inscrições para cada vaga
      const vagasComInscArray: VagaComInscricoes[] = [];

      for (const vaga of vagas) {
        try {
          const inscResponse = await fetch(`/api/inscricoes/vaga/${vaga.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (inscResponse.ok) {
            const inscricoes = await inscResponse.json();
            vagasComInscArray.push({
              vaga,
              inscricoes: Array.isArray(inscricoes) ? inscricoes : [],
            });
          } else {
            vagasComInscArray.push({
              vaga,
              inscricoes: [],
            });
          }
        } catch (err) {
          console.error(`Erro ao carregar inscrições para vaga ${vaga.id}:`, err);
          vagasComInscArray.push({
            vaga,
            inscricoes: [],
          });
        }
      }

      setVagasComInscricoes(vagasComInscArray);
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err);
      setError('Erro ao carregar inscrições. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inscricaoId: number, novoStatus: string) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/inscricoes/${inscricaoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Atualizar lista localmente
      setVagasComInscricoes((prev) =>
        prev.map((item) => ({
          ...item,
          inscricoes: item.inscricoes.map((insc) =>
            insc.id === inscricaoId ? { ...insc, status: novoStatus as any } : insc
          ),
        }))
      );
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status. Tente novamente.');
    }
  };

  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return styles.aprovado;
      case 'REJEITADO':
        return styles.rejeitado;
      default:
        return styles.pendente;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando inscrições...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <a href="/dashboard" className={styles.backBtn}>
        ← Voltar
      </a>

      <div className={styles.header}>
        <h1>Inscrições Recebidas</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {vagasComInscricoes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma vaga publicada ainda.</p>
          <a href="/criar-vaga" className={styles.ctaBtn}>
            Criar Primeira Vaga
          </a>
        </div>
      ) : (
        <div className={styles.vagasContainer}>
          {vagasComInscricoes.map((item) => (
            <div key={item.vaga.id} className={styles.vagaCard}>
              <div className={styles.vagaHeader}>
                <h2>{item.vaga.titulo}</h2>
                <span className={item.vaga.aberta ? styles.aberta : styles.encerrada}>
                  {item.vaga.aberta ? 'Aberta' : 'Encerrada'}
                </span>
              </div>

              <div className={styles.inscCount}>
                <strong>{item.inscricoes.length}</strong> inscrição{item.inscricoes.length !== 1 ? 'ões' : ''}
              </div>

              {item.inscricoes.length === 0 ? (
                <div className={styles.noInscricoes}>Nenhuma inscrição ainda</div>
              ) : (
                <div className={styles.inscTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.colNome}>Nome</div>
                    <div className={styles.colEmail}>Email</div>
                    <div className={styles.colData}>Data de Inscrição</div>
                    <div className={styles.colStatus}>Status</div>
                    <div className={styles.colAcoes}>Ações</div>
                  </div>

                  {item.inscricoes.map((inscricao) => (
                    <div key={inscricao.id} className={styles.tableRow}>
                      <div className={styles.colNome}>{inscricao.estudante.nome}</div>
                      <div className={styles.colEmail}>
                        <a href={`mailto:${inscricao.estudante.email}`}>
                          {inscricao.estudante.email}
                        </a>
                      </div>
                      <div className={styles.colData}>{formatData(inscricao.dataInscricao)}</div>
                      <div className={styles.colStatus}>
                        <span className={`${styles.status} ${getStatusClass(inscricao.status)}`}>
                          {inscricao.status === 'APROVADO'
                            ? 'Aprovado'
                            : inscricao.status === 'REJEITADO'
                            ? 'Rejeitado'
                            : 'Pendente'}
                        </span>
                      </div>
                      <div className={styles.colAcoes}>
                        <select
                          value={inscricao.status}
                          onChange={(e) => handleStatusChange(inscricao.id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          <option value="PENDENTE">Pendente</option>
                          <option value="APROVADO">Aprovado</option>
                          <option value="REJEITADO">Rejeitado</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
