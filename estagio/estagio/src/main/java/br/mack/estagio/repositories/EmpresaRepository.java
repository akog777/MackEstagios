package br.mack.estagio.repositories;

import br.mack.estagio.entities.Empresa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByCnpj(String cnpj);
    Optional<Empresa> findByEmail(String email);
    List<Empresa> findByAreasAtuacao_NomeContaining(String area);
    long count();
}
