package br.mack.estagio.dto;

import lombok.Data;

@Data
public class EstudanteDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String curso;
    private String email;
    private String telefone;
}
