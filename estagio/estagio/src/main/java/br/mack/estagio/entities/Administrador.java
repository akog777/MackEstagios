package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String email;
    private String senha;
}
