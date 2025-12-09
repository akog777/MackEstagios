package br.mack.estagio.dto;

import lombok.Data;

/**
 * DTO para criar ou atualizar uma avaliação de vaga.
 * 
 * Campos:
 * - estudanteId: ID do estudante que está avaliando
 * - vagaId: ID da vaga sendo avaliada
 * - nota: Avaliação de 1 a 5 estrelas
 * - comentario: Feedback detalhado sobre a experiência
 */
@Data
public class AvaliacaoDTO {
    private Long estudanteId;
    private Long vagaId;
    private Integer nota;
    private String comentario;
}
