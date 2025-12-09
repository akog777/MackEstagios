package br.mack.estagio.dto;

import lombok.Data;

// DTO para requisição de login.
@Data
public class LoginRequest {
    private String email;
    private String senha;
    private String role;
}
