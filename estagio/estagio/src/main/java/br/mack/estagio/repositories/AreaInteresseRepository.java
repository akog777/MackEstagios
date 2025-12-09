package br.mack.estagio.repositories;

import br.mack.estagio.entities.AreaInteresse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AreaInteresseRepository extends JpaRepository<AreaInteresse, Long> {
    Optional<AreaInteresse> findByNome(String nome);
}
