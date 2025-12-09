'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin-areas.module.css';

interface Area { id: number; nome: string; descricao?: string }

export default function AdminAreasPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [editing, setEditing] = useState<Area | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) { router.push('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin' && user.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchAreas(token);
  }, [router]);

  const fetchAreas = async (token: string) => {
    try {
      const res = await fetch('/api/areas-interesse', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erro ao buscar áreas');
      const data = await res.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err); setError('Não foi possível carregar áreas');
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!nome.trim()) { alert('Nome obrigatório'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/areas-interesse', {
        method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, descricao })
      });
      if (!res.ok) throw new Error('Falha ao criar área');
      const created = await res.json();
      setAreas(prev => [created, ...prev]);
      setNome(''); setDescricao('');
    } catch (err) { console.error(err); alert('Erro ao criar área'); }
  };

  const startEdit = (area: Area) => { setEditing(area); setNome(area.nome); setDescricao(area.descricao || ''); };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/areas-interesse/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, descricao })
      });
      if (!res.ok) throw new Error('Falha ao atualizar área');
      const updated = await res.json();
      setAreas(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditing(null); setNome(''); setDescricao('');
    } catch (err) { console.error(err); alert('Erro ao atualizar área'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover área?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/areas-interesse/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao remover');
      setAreas(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); alert('Erro ao remover área'); }
  };

  if (loading) return <div className={styles.container}><p>Carregando áreas...</p></div>;

  return (
    <div className={styles.container}>
      <a href="/dashboard" className={styles.backBtn}>← Voltar ao Dashboard</a>
      <h1 className={styles.pageTitle}>Gerenciar Áreas de Interesse</h1>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.form}>
        <input placeholder="Nome da área" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        {editing ? (
          <>
            <button onClick={handleSave} className={styles.saveBtn}>Salvar</button>
            <button onClick={() => { setEditing(null); setNome(''); setDescricao(''); }} className={styles.cancelBtn}>Cancelar</button>
          </>
        ) : (
          <button onClick={handleCreate} className={styles.saveBtn}>Criar Área</button>
        )}
      </div>

      <div className={styles.list}>
        {areas.map(a => (
          <div key={a.id} className={styles.item}>
            <div>
              <div className={styles.title}>{a.nome}</div>
              {a.descricao && <div className={styles.desc}>{a.descricao}</div>}
            </div>
            <div className={styles.actions}>
              <button onClick={() => startEdit(a)} className={styles.editBtn}>Editar</button>
              <button onClick={() => handleDelete(a.id)} className={styles.deleteBtn}>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}