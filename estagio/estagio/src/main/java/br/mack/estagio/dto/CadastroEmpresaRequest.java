package br.mack.estagio.dto;

import lombok.Data;

@Data
public class CadastroEmpresaRequest {
    private String nome;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private String senha;
}
