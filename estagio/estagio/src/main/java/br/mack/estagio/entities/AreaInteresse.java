package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AreaInteresse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
}
