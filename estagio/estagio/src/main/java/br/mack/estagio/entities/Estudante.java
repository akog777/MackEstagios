package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Entity
@Data
public class Estudante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String cpf;
    private String curso;
    private String email;
    private String telefone;
    private String senha;

    @ManyToMany
    @JoinTable(
        name = "estudante_areas",
        joinColumns = @JoinColumn(name = "estudante_id"),
        inverseJoinColumns = @JoinColumn(name = "area_id")
    )
    private Set<AreaInteresse> areasInteresse;

    private Integer pontos = 0; // Pontuação acumulada do estudante

    @ElementCollection
    @CollectionTable(name = "estudante_badges", joinColumns = @JoinColumn(name = "estudante_id"))
    @Column(name = "badge")
    private Set<String> badges; // Conjunto de conquistas (ex.: "Primeira Inscrição", "10 Inscrições")
}
