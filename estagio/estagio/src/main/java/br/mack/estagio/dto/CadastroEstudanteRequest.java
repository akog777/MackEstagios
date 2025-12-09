package br.mack.estagio.dto;

import lombok.Data;

@Data
public class CadastroEstudanteRequest {
    private String nome;
    private String cpf;
    private String curso;
    private String email;
    private String telefone;
    private String senha;
}
