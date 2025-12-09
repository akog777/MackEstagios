package br.mack.estagio.controllers;

import br.mack.estagio.entities.Avaliacao;
import br.mack.estagio.entities.Estudante;
import br.mack.estagio.entities.VagaEstagio;
import br.mack.estagio.repositories.AvaliacaoRepository;
import br.mack.estagio.repositories.EstudanteRepository;
import br.mack.estagio.repositories.VagaEstagioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller para gerenciar avaliações de vagas de estágio.
 * 
 * Funcionalidades:
 * - Permitir que estudantes avaliem vagas onde se inscreveram
 * - Listar avaliações de uma vaga com média de notas
 * - Visualizar feedback de ex-estagiários
 * - Impedir múltiplas avaliações do mesmo estudante na mesma vaga
 * - Fornecer estatísticas de avaliações para ajudar outros estudantes
 */
@RestController
@RequestMapping("/avaliacoes")
@CrossOrigin(origins = "http://localhost:3000")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private EstudanteRepository estudanteRepository;

    @Autowired
    private VagaEstagioRepository vagaEstagioRepository;

    /**
     * Recupera todas as avaliações de uma vaga específica.
     * Exibe feedback de ex-estagiários para ajudar outros estudantes
     * na decisão de se inscrever.
     * 
     * @param vagaId ID da vaga de estágio
     * @return Lista de avaliações com notas e comentários
     */
    @GetMapping("/vaga/{vagaId}")
    public List<Avaliacao> getAvaliacoesPorVaga(@PathVariable Long vagaId) {
        return avaliacaoRepository.findByVaga_Id(vagaId);
    }

    /**
     * Recupera as estatísticas de uma vaga incluindo:
     * - Média de notas
     * - Quantidade total de avaliações
     * - Todas as avaliações detalhadas
     * 
     * @param vagaId ID da vaga
     * @return Map com media, total e lista de avaliações
     */
    @GetMapping("/vaga/{vagaId}/estatisticas")
    public Map<String, Object> getEstatisticasVaga(@PathVariable Long vagaId) {
        Map<String, Object> stats = new HashMap<>();
        
        Double media = avaliacaoRepository.calcularMediaNotaVaga(vagaId)
            .orElse(0.0);
        long total = avaliacaoRepository.contarAvaliacoes(vagaId);
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByVaga_Id(vagaId);
        
        stats.put("mediaNotas", Math.round(media * 10.0) / 10.0); // Arredondar para 1 casa decimal
        stats.put("totalAvaliacoes", total);
        stats.put("avaliacoes", avaliacoes);
        
        return stats;
    }

    /**
     * Recupera todas as avaliações feitas por um estudante específico.
     * Útil para visualizar histórico de feedback enviado.
     * 
     * @param estudanteId ID do estudante
     * @return Lista de avaliações do estudante
     */
    @GetMapping("/estudante/{estudanteId}")
    public List<Avaliacao> getAvaliacoesPorEstudante(@PathVariable Long estudanteId) {
        return avaliacaoRepository.findByEstudante_Id(estudanteId);
    }

    /**
     * Cria uma nova avaliação de vaga.
     * 
     * Validações:
     * - Estudante deve existir
     * - Vaga deve existir
     * - Nota deve estar entre 1 e 5
     * - Estudante não pode avaliar a mesma vaga duas vezes
     * 
     * @param avaliacao Objeto com estudante.id, vaga.id, nota e comentario
     * @return Avaliação salva com ID gerado
     */
    @PostMapping
    public Avaliacao criarAvaliacao(@RequestBody Avaliacao avaliacao) {
        // Validar se estudante existe
        if (avaliacao.getEstudante() == null || avaliacao.getEstudante().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estudante é obrigatório");
        }
        
        Estudante estudante = estudanteRepository.findById(avaliacao.getEstudante().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado"));
        
        // Validar se vaga existe
        if (avaliacao.getVaga() == null || avaliacao.getVaga().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vaga é obrigatória");
        }
        
        VagaEstagio vaga = vagaEstagioRepository.findById(avaliacao.getVaga().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaga não encontrada"));
        
        // Validar nota (1-5)
        if (avaliacao.getNota() == null || avaliacao.getNota() < 1 || avaliacao.getNota() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota deve estar entre 1 e 5");
        }
        
        // Validar duplicação: não permitir que o mesmo estudante avalie a mesma vaga duas vezes
        if (avaliacaoRepository.existsByEstudante_IdAndVaga_Id(estudante.getId(), vaga.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Você já avaliou esta vaga. Não é permitido avaliar duas vezes.");
        }
        
        avaliacao.setEstudante(estudante);
        avaliacao.setVaga(vaga);
        
        return avaliacaoRepository.save(avaliacao);
    }

    /**
     * Atualiza uma avaliação existente.
     * Permite que o estudante edite sua nota e comentário.
     * 
     * @param id ID da avaliação a atualizar
     * @param avaliacaoAtualizada Novos dados (nota e comentario)
     * @return Avaliação atualizada
     */
    @PutMapping("/{id}")
    public Avaliacao atualizarAvaliacao(@PathVariable Long id, @RequestBody Avaliacao avaliacaoAtualizada) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada"));
        
        // Validar nova nota
        if (avaliacaoAtualizada.getNota() != null) {
            if (avaliacaoAtualizada.getNota() < 1 || avaliacaoAtualizada.getNota() > 5) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota deve estar entre 1 e 5");
            }
            avaliacao.setNota(avaliacaoAtualizada.getNota());
        }
        
        // Atualizar comentário
        if (avaliacaoAtualizada.getComentario() != null) {
            avaliacao.setComentario(avaliacaoAtualizada.getComentario());
        }
        
        return avaliacaoRepository.save(avaliacao);
    }

    /**
     * Deleta uma avaliação existente.
     * Permite que estudantes removam suas avaliações se desejarem.
     * 
     * @param id ID da avaliação a deletar
     */
    @DeleteMapping("/{id}")
    public void deletarAvaliacao(@PathVariable Long id) {
        if (!avaliacaoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada");
        }
        avaliacaoRepository.deleteById(id);
    }
}
