'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './meu-perfil.module.css';

interface Estudante {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    cpf: string;
    curso: string;
    areasInteresse?: { id: number; nome: string }[];
    dataCadastro?: string;
}

export default function MeuPerfilPage() {
    const router = useRouter();
    const [estudante, setEstudante] = useState<Estudante | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Estado para edição de campos
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        curso: ''
    });

    const [todasAreas, setTodasAreas] = useState<{ id: number; nome: string }[]>([]);
    const [areasInteresse, setAreasInteresse] = useState<number[]>([]);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchEstudante = async () => {
            try {
                const userObj = JSON.parse(user);
                const token = localStorage.getItem('token');

                // Buscar dados do estudante
                const response = await fetch(`/api/estudantes/${userObj.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar perfil');
                }

                const data = await response.json();
                setEstudante(data);
                setFormData({
                    nome: data.nome,
                    telefone: data.telefone || '',
                    curso: data.curso || ''
                });
                setAreasInteresse(data.areasInteresse?.map((a: any) => a.id) || []);

                // Buscar todas as áreas de interesse
                const areasResponse = await fetch('/api/areas-interesse', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (areasResponse.ok) {
                    const areasData = await areasResponse.json();
                    setTodasAreas(areasData);
                }
            } catch (err) {
                setError('Erro ao carregar seu perfil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEstudante();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAreaChange = (areaId: number) => {
        setAreasInteresse(prev =>
            prev.includes(areaId)
                ? prev.filter(id => id !== areaId)
                : [...prev, areaId]
        );
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

            // Atualizar dados do estudante
            const response = await fetch(`/api/estudantes/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    curso: formData.curso,
                    areasInteresse: areasInteresse.map(id => ({ id }))
                })
            });

            if (response.ok) {
                const updatedEstudante = await response.json();
                setEstudante(updatedEstudante);
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

    if (error || !estudante) {
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
                    <h1>Meu Perfil</h1>
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
                            <label htmlFor="nome">Nome *</label>
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
                                value={estudante.email}
                                disabled
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="cpf">CPF (não editável)</label>
                            <input
                                id="cpf"
                                type="text"
                                value={estudante.cpf}
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
                            <label htmlFor="curso">Curso</label>
                            <input
                                id="curso"
                                type="text"
                                name="curso"
                                value={formData.curso}
                                onChange={handleInputChange}
                                placeholder="Ex: Engenharia de Software"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Áreas de Interesse</label>
                            <div className={styles.areasContainer}>
                                {todasAreas.length > 0 ? (
                                    todasAreas.map(area => (
                                        <label key={area.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={areasInteresse.includes(area.id)}
                                                onChange={() => handleAreaChange(area.id)}
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
                            <span className={styles.label}>Nome:</span>
                            <span className={styles.value}>{estudante.nome}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{estudante.email}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>CPF:</span>
                            <span className={styles.value}>{estudante.cpf}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Telefone:</span>
                            <span className={styles.value}>{estudante.telefone || 'Não informado'}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.label}>Curso:</span>
                            <span className={styles.value}>{estudante.curso || 'Não informado'}</span>
                        </div>

                        {estudante.areasInteresse && estudante.areasInteresse.length > 0 && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Áreas de Interesse:</span>
                                <div className={styles.areasDisplay}>
                                    {estudante.areasInteresse.map(area => (
                                        <span key={area.id} className={styles.areaBadge}>
                                            {area.nome}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {estudante.dataCadastro && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Cadastrado em:</span>
                                <span className={styles.value}>
                                    {new Date(estudante.dataCadastro).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
