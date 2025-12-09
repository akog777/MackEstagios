package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Entidade que representa a avaliação de uma vaga de estágio por um ex-estagiário.
 * 
 * Funcionalidades:
 * - Armazenar nota (1-5) dada por um estudante sobre uma vaga
 * - Armazenar comentário/feedback do estudante
 * - Registrar data da avaliação
 * - Relacionar avaliação com estudante e vaga
 * - Permitir múltiplas avaliações por vaga para análise de média
 */
@Entity
@Data
public class Avaliacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Estudante que fez a avaliação (ex-estagiário ou candidato que experimentou a vaga).
     */
    @ManyToOne
    @JoinColumn(name = "estudante_id")
    private Estudante estudante;
    
    /**
     * Vaga de estágio sendo avaliada.
     */
    @ManyToOne
    @JoinColumn(name = "vaga_id")
    private VagaEstagio vaga;
    
    /**
     * Nota da avaliação de 1 a 5 estrelas.
     * 1 = Péssimo, 2 = Ruim, 3 = Médio, 4 = Bom, 5 = Excelente
     */
    private Integer nota;
    
    /**
     * Comentário detalhado do estudante sobre a experiência na vaga.
     * Pode incluir feedback sobre ambiente, aprendizado, remuneração, etc.
     */
    @Column(length = 1000)
    private String comentario;
    
    /**
     * Timestamp de quando a avaliação foi criada.
     */
    private LocalDateTime dataAvaliacao = LocalDateTime.now();
}
