package br.mack.estagio.repositories;

import br.mack.estagio.entities.Estudante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface EstudanteRepository extends JpaRepository<Estudante, Long> {
    Optional<Estudante> findByCpf(String cpf);
    Optional<Estudante> findByEmail(String email);
    List<Estudante> findByAreasInteresse_NomeContaining(String area);
    long count();

    // Métodos para gamificação
    List<Estudante> findTop10ByOrderByPontosDesc(); // Top 10 estudantes por pontos
    List<Estudante> findByBadgesContaining(String badge); // Estudantes com uma badge específica
}
