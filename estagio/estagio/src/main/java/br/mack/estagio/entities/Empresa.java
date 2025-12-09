package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Entity
@Data
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String cnpj;
    private String email;
    private String telefone;
    private String endereco;
    private String senha;

    @ManyToMany
    @JoinTable(
        name = "empresa_areas",
        joinColumns = @JoinColumn(name = "empresa_id"),
        inverseJoinColumns = @JoinColumn(name = "area_id")
    )
    private Set<AreaInteresse> areasAtuacao;
}
