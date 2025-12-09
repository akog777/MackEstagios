package br.mack.estagio.repositories;

import br.mack.estagio.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    List<Inscricao> findByEstudanteId(Long estudanteId);
    List<Inscricao> findByVagaId(Long vagaId);
    boolean existsByEstudanteIdAndVagaId(Long estudanteId, Long vagaId);
    Optional<Inscricao> findByEstudanteAndVaga(Estudante estudante, VagaEstagio vaga);
    List<Inscricao> findByVaga_Empresa_Id(Long empresaId);
}
