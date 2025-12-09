package br.mack.estagio.repositories;

import br.mack.estagio.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    List<Usuario> findByRole(String role);
}
