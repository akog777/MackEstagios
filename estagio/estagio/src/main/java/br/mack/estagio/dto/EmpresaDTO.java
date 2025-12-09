package br.mack.estagio.dto;

import lombok.Data;

@Data
public class EmpresaDTO {
    private Long id;
    private String nome;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
}
