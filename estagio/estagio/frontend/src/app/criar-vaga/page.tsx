'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './criar-vaga.module.css';

export default function CriarVagaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        localizacao: '',
        modalidade: '',
        cargaHoraria: 20,
        requisitos: ''
    });

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
    }, [router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'cargaHoraria' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validar campos obrigatórios
        if (!formData.titulo.trim()) {
            setError('Título é obrigatório');
            setLoading(false);
            return;
        }
        if (!formData.descricao.trim()) {
            setError('Descrição é obrigatória');
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');

            const vagaData = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                localizacao: formData.localizacao || null,
                modalidade: formData.modalidade || null,
                cargaHoraria: formData.cargaHoraria,
                requisitos: formData.requisitos || null,
                empresa: { id: user.id },
                aberta: true
            };

            const response = await fetch('/api/vagas-estagio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(vagaData)
            });

            if (response.ok) {
                alert('Vaga criada com sucesso! 🎉');
                router.push('/minhas-vagas');
            } else {
                const errData = await response.json();
                setError(`Erro ao criar vaga: ${errData.message || 'Tente novamente'}`);
            }
        } catch (err) {
            setError('Erro ao criar vaga. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/minhas-vagas" className={styles.backBtn}>← Voltar</Link>

            <div className={styles.formCard}>
                <h1>Criar Nova Vaga</h1>
                <p className={styles.subtitle}>Preencha os detalhes da vaga de estágio</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="titulo">Título da Vaga *</label>
                        <input
                            id="titulo"
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            placeholder="Ex: Estágio em Desenvolvimento"
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="descricao">Descrição *</label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleInputChange}
                            placeholder="Descreva a vaga, responsabilidades, benefícios..."
                            className={styles.textarea}
                            rows={5}
                            required
                        />
                    </div>

                    <div className={styles.twoColumns}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="localizacao">Localização</label>
                            <input
                                id="localizacao"
                                type="text"
                                name="localizacao"
                                value={formData.localizacao}
                                onChange={handleInputChange}
                                placeholder="Ex: São Paulo, SP"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="modalidade">Modalidade</label>
                            <select
                                id="modalidade"
                                name="modalidade"
                                value={formData.modalidade}
                                onChange={handleInputChange}
                                className={styles.input}
                            >
                                <option value="">Selecione...</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Remoto">Remoto</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.twoColumns}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="cargaHoraria">Carga Horária (h/semana)</label>
                            <input
                                id="cargaHoraria"
                                type="number"
                                name="cargaHoraria"
                                value={formData.cargaHoraria}
                                onChange={handleInputChange}
                                min="0"
                                max="40"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="requisitos">Requisitos</label>
                            <input
                                id="requisitos"
                                type="text"
                                name="requisitos"
                                value={formData.requisitos}
                                onChange={handleInputChange}
                                placeholder="Ex: Conhecimento em JavaScript"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitBtn}
                        >
                            {loading ? 'Criando...' : '✅ Criar Vaga'}
                        </button>
                        <Link href="/minhas-vagas" className={styles.cancelBtn}>
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
