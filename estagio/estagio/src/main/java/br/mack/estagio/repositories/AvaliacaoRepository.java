package br.mack.estagio.repositories;

import br.mack.estagio.entities.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para persistência e consulta de avaliações de vagas.
 * 
 * Fornece operações para:
 * - Listar avaliações de uma vaga específica
 * - Verificar se um estudante já avaliou uma vaga (evitar duplicação)
 * - Calcular média de notas de uma vaga
 * - Encontrar avaliações por estudante
 */
@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    
    /**
     * Encontra todas as avaliações de uma vaga específica.
     * Útil para exibir feedback de ex-estagiários sobre a vaga.
     * 
     * @param vagaId ID da vaga
     * @return Lista de avaliações da vaga
     */
    List<Avaliacao> findByVaga_Id(Long vagaId);
    
    /**
     * Encontra todas as avaliações feitas por um estudante.
     * 
     * @param estudanteId ID do estudante
     * @return Lista de avaliações do estudante
     */
    List<Avaliacao> findByEstudante_Id(Long estudanteId);
    
    /**
     * Verifica se um estudante já avaliou uma vaga específica.
     * Previne múltiplas avaliações do mesmo estudante na mesma vaga.
     * 
     * @param estudanteId ID do estudante
     * @param vagaId ID da vaga
     * @return true se já existe avaliação, false caso contrário
     */
    boolean existsByEstudante_IdAndVaga_Id(Long estudanteId, Long vagaId);
    
    /**
     * Calcula a média de notas para uma vaga específica.
     * Agrupa todas as avaliações e calcula a média.
     * 
     * @param vagaId ID da vaga
     * @return Média de notas (ex: 4.2)
     */
    @Query("SELECT AVG(a.nota) FROM Avaliacao a WHERE a.vaga.id = ?1")
    Optional<Double> calcularMediaNotaVaga(Long vagaId);
    
    /**
     * Conta quantas avaliações uma vaga recebeu.
     * 
     * @param vagaId ID da vaga
     * @return Número de avaliações
     */
    @Query("SELECT COUNT(a) FROM Avaliacao a WHERE a.vaga.id = ?1")
    long contarAvaliacoes(Long vagaId);
}
