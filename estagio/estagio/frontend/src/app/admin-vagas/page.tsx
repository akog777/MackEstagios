'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin-vagas.module.css';

interface Vaga { id: number; titulo: string; empresa?: any; aberta: boolean }

export default function AdminVagasPage() {
  const router = useRouter();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) { router.push('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin' && user.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchVagas(token);
  }, [router]);

  const fetchVagas = async (token: string) => {
    try {
      // Buscar TODAS as vagas (abertas e encerradas)
      const res = await fetch('/api/vagas-estagio/abertas', { headers: { Authorization: `Bearer ${token}` } });
      const abertas = res.ok ? await res.json() : [];
      
      const res2 = await fetch('/api/vagas-estagio', { headers: { Authorization: `Bearer ${token}` } });
      const todas = res2.ok ? await res2.json() : [];
      
      // Se a API /api/vagas-estagio retornar todas, usar ela. Senão, usar só abertas.
      const allVagas = Array.isArray(todas) && todas.length > 0 ? todas : abertas;
      setVagas(allVagas);
    } catch (err) { 
      console.error(err); 
      setError('Não foi possível carregar vagas'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover vaga?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vagas-estagio/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao remover vaga');
      setVagas(prev => prev.filter(v => v.id !== id));
    } catch (err) { console.error(err); alert('Erro ao remover vaga'); }
  };

  const handleEncerrar = async (id: number) => {
    if (!confirm('Encerrar esta vaga?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vagas-estagio/${id}/encerrar`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao encerrar vaga');
      const updated = await res.json();
      setVagas(prev => prev.map(v => v.id === updated.id ? updated : v));
    } catch (err) { console.error(err); alert('Erro ao encerrar vaga'); }
  };

  if (loading) return <div className={styles.container}><p>Carregando vagas...</p></div>;

  return (
    <div className={styles.container}>
      <a href="/dashboard" className={styles.backBtn}>← Voltar ao Dashboard</a>
      <h1 className={styles.pageTitle}>Gerenciar Todas as Vagas</h1>
      {error && <div className={styles.error}>{error}</div>}

      {vagas.length === 0 ? (
        <div className={styles.empty}>Nenhuma vaga encontrada</div>
      ) : (
        <div className={styles.list}>
          {vagas.map(v => (
            <div key={v.id} className={styles.item}>
              <div>
                <div className={styles.title}>{v.titulo}</div>
                <div className={styles.meta}>{v.empresa?.nome || 'Empresa não informada'}</div>
              </div>
              <div className={styles.actions}>
                {!v.aberta && <span className={styles.closed}>Encerrada</span>}
                {v.aberta && <button onClick={() => handleEncerrar(v.id)} className={styles.encerrarBtn}>Encerrar</button>}
                <button onClick={() => handleDelete(v.id)} className={styles.deleteBtn}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}