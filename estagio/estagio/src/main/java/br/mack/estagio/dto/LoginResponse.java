package br.mack.estagio.dto;

import lombok.Data;

// DTO para resposta de login.
@Data
public class LoginResponse {
    private String token;
    private String role;
    private Long id;
    private String nome;
}
