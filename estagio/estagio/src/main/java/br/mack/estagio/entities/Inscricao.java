package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Inscricao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "estudante_id")
    private Estudante estudante;

    @ManyToOne
    @JoinColumn(name = "vaga_id")
    private VagaEstagio vaga;

    private LocalDateTime dataInscricao = LocalDateTime.now();
}
