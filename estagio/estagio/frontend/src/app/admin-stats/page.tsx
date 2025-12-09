'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin-stats.module.css';

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch('/api/dashboard/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao carregar estatísticas');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}><p>Carregando estatísticas...</p></div>;

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backBtn}>← Voltar ao Dashboard</Link>
      <h1 className={styles.pageTitle}>Dashboard Administrativo</h1>
      {error && <div className={styles.error}>{error}</div>}

      {stats ? (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Total de Empresas</h3>
            <p>{stats.totalEmpresas}</p>
          </div>

          <div className={styles.card}>
            <h3>Total de Estudantes</h3>
            <p>{stats.totalEstudantes}</p>
          </div>

          <div className={styles.card}>
            <h3>Vagas Abertas</h3>
            <p>{stats.vagasAbertas}</p>
          </div>

          <div className={styles.card}>
            <h3>Vagas Encerradas</h3>
            <p>{stats.vagasEncerradas}</p>
          </div>

          <div className={styles.cardWide}>
            <h3>Vagas por Área</h3>
            {stats.vagasPorArea && Array.isArray(stats.vagasPorArea) && (
              <ul className={styles.list}>
                {stats.vagasPorArea.map((item: any, idx: number) => (
                  <li key={idx}>
                    {item[0] || 'Sem área'} — <strong>{item[1]}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>Nenhuma estatística disponível.</div>
      )}
    </div>
  );
}