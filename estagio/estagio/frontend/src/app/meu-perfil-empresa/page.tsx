'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './meu-perfil-empresa.module.css';

interface Empresa {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    cnpj: string;
    endereco: string;
    descricao?: string;
    areasAtuacao?: { id: number; nome: string }[];
}

export default function MeuPerfilEmpresaPage() {
    const router = useRouter();
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        endereco: '',
        descricao: ''
    });
    const [todasAreas, setTodasAreas] = useState<{ id: number; nome: string }[]>([]);
    const [areasAtuacao, setAreasAtuacao] = useState<number[]>([]);
    const [minhasVagas, setMinhasVagas] = useState<any[]>([]);

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

        const fetchEmpresa = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`/api/empresas/${userObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar perfil');
                }

                const data = await response.json();
                setEmpresa(data);
                setFormData({
                    nome: data.nome || '',
                    telefone: data.telefone || '',
                    endereco: data.endereco || '',
                    descricao: data.descricao || ''
                });
                setAreasAtuacao(data.areasAtuacao?.map((a: any) => a.id) || []);

                const areasResponse = await fetch('/api/areas-interesse', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (areasResponse.ok) {
                    const areasData = await areasResponse.json();
                    setTodasAreas(areasData);
                }

                const vagasResponse = await fetch(`/api/vagas-estagio/empresa/${userObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (vagasResponse.ok) {
                    const vagasData = await vagasResponse.json();
                    setMinhasVagas(Array.isArray(vagasData) ? vagasData : []);
                }
            } catch (err) {
                setError('Erro ao carregar seu perfil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmpresa();
    }, [router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.nome.trim()) {
            alert('Nome é obrigatório');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await fetch(`/api/empresas/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    endereco: formData.endereco,
                    descricao: formData.descricao,
                    areasAtuacao: areasAtuacao.map(id => ({ id }))
                })
            });

            if (response.ok) {
                const updatedEmpresa = await response.json();
                setEmpresa(updatedEmpresa);
                setAreasAtuacao(updatedEmpresa.areasAtuacao?.map((a: any) => a.id) || []);
                setEditing(false);
                alert('Perfil atualizado com sucesso!');
            } else {
                alert('Erro ao atualizar perfil');
            }
        } catch (err) {
            alert('Erro ao salvar perfil');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <p>Carregando perfil...</p>
            </div>
        );
    }

    if (error || !empresa) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>{error || 'Erro ao carregar perfil'}</p>
                <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/dashboard" className={styles.backBtn}>← Voltar</Link>

            <div className={styles.perfilCard}>
                <div className={styles.header}>
                    <h1>Perfil da Empresa</h1>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className={styles.editBtn}
                        >
                            ✏️ Editar
                        </button>
                    )}
                </div>

                {editing ? (
                    <div className={styles.formContainer}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Razão Social *</label>
                            <input
                                id="nome"
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email (não editável)</label>
                            <input
                                id="email"
                                type="email"
                                value={empresa.email}
                                disabled
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="cnpj">CNPJ (não editável)</label>
                            <input
                                id="cnpj"
                                type="text"
                                value={empresa.cnpj}
                                disabled
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="telefone">Telefone</label>
                            <input
                                id="telefone"
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleInputChange}
                                placeholder="(XX) XXXXX-XXXX"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="endereco">Endereço</label>
                            <input
                                id="endereco"
                                type="text"
                                name="endereco"
                                value={formData.endereco}
                                onChange={handleInputChange}
                                placeholder="Ex: Rua..., Cidade, Estado"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="descricao">Descrição da Empresa</label>
                            <textarea
                                id="descricao"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleInputChange}
                                placeholder="Descreva sobre sua empresa..."
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Áreas de Atuação</label>
                            <div className={styles.areasContainer}>
                                {todasAreas.length > 0 ? (
                                    todasAreas.map(area => (
                                        <label key={area.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={areasAtuacao.includes(area.id)}
                                                onChange={() => {
                                                    setAreasAtuacao(prev => prev.includes(area.id) ? prev.filter(id => id !== area.id) : [...prev, area.id]);
                                                }}
                                            />
                                            {area.nome}
                                        </label>
                                    ))
                                ) : (
                                    <p>Carregando áreas...</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={styles.saveBtn}
                            >
                                {saving ? 'Salvando...' : '✅ Salvar Alterações'}
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className={styles.cancelBtn}
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.viewContainer}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Razão Social:</span>
                            <span className={styles.value}>{empresa.nome}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{empresa.email}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>CNPJ:</span>
                            <span className={styles.value}>{empresa.cnpj}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Telefone:</span>
                            <span className={styles.value}>{empresa.telefone || 'Não informado'}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Endereço:</span>
                            <span className={styles.value}>{empresa.endereco || 'Não informado'}</span>
                        </div>

                        {empresa.descricao && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Descrição:</span>
                                <span className={styles.value}>{empresa.descricao}</span>
                            </div>
                        )}

                        {empresa.areasAtuacao && empresa.areasAtuacao.length > 0 && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Áreas de Atuação:</span>
                                <div className={styles.areasDisplay}>
                                    {empresa.areasAtuacao.map(a => (
                                        <span key={a.id} className={styles.areaBadge}>{a.nome}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {minhasVagas && minhasVagas.length > 0 && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Vagas publicadas:</span>
                                <div className={styles.areasDisplay}>
                                    {minhasVagas.map(v => (
                                        <div key={v.id} className={styles.vagaItem}>
                                            <Link href={`/vaga/${v.id}`} className={styles.vagaLink}>{v.titulo}</Link>
                                            <span className={styles.vagaStatus}>{v.aberta ? ' (Aberta)' : ' (Encerrada)'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}