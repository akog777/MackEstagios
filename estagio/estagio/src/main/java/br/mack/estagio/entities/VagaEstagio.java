package br.mack.estagio.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class VagaEstagio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "area_id")
    private AreaInteresse area;
    private String localizacao;
    private String modalidade; // e.g., REMOTO, PRESENCIAL, HIBRIDO
    private int cargaHoraria;
    private String requisitos;
    private boolean aberta = true; // Default to open
    
    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
}
