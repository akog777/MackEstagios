package br.mack.estagio.dto;

import lombok.Data;

@Data
public class VagaDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private Long areaId;
    private String localizacao;
    private String modalidade;
    private int cargaHoraria;
    private String requisitos;
    private boolean aberta;
    private Long empresaId;
}
