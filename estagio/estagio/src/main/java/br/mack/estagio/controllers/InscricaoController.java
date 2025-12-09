// Controller para gerenciar operações relacionadas a Inscrições em vagas.
// Permite estudantes se inscreverem em vagas abertas, com validações e gamificação.
package br.mack.estagio.controllers;

import br.mack.estagio.entities.Inscricao;
import br.mack.estagio.repositories.InscricaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/inscricoes")
@CrossOrigin(origins = "http://localhost:3000")
public class InscricaoController {

    @Autowired
    private InscricaoRepository inscricaoRepository;

    @Autowired
    private br.mack.estagio.repositories.EstudanteRepository estudanteRepository;

    // Retorna inscrições de um estudante específico.
    @GetMapping("/estudante/{estudanteId}")
    public List<Inscricao> getByEstudante(@PathVariable Long estudanteId) {
        return inscricaoRepository.findByEstudanteId(estudanteId);
    }

    // Retorna inscrições de uma vaga específica.
    @GetMapping("/vaga/{vagaId}")
    public List<Inscricao> getByVaga(@PathVariable Long vagaId) {
        return inscricaoRepository.findByVagaId(vagaId);
    }

    // Cria uma nova inscrição em uma vaga. Valida se a vaga está aberta, se o estudante já se inscreveu, e concede pontos/badges.
    @PostMapping
    public Inscricao create(@RequestBody Inscricao inscricao) {
        if (!inscricao.getVaga().isAberta()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível se inscrever em uma vaga encerrada.");
        }
        if (inscricaoRepository.existsByEstudanteIdAndVagaId(inscricao.getEstudante().getId(), inscricao.getVaga().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O estudante já se inscreveu nesta vaga.");
        }
        if (inscricao.getEstudante() == null || inscricao.getEstudante().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estudante é obrigatório.");
        }
        if (inscricao.getVaga() == null || inscricao.getVaga().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vaga é obrigatória.");
        }

        Inscricao savedInscricao = inscricaoRepository.save(inscricao);
        estudanteRepository.findById(inscricao.getEstudante().getId()).ifPresent(estudante -> {
            estudante.setPontos(estudante.getPontos() + 5); // +5 pontos por inscrição
            if (estudante.getBadges().isEmpty()) {
                estudante.getBadges().add("Primeira Inscrição");
            }
            estudanteRepository.save(estudante);
        });

        return savedInscricao;
    }

    // Atualiza uma inscrição existente.
    @PutMapping("/{id}")
    public Inscricao update(@PathVariable Long id, @RequestBody Inscricao inscricao) {
        inscricao.setId(id);
        return inscricaoRepository.save(inscricao);
    }

    // Deleta uma inscrição pelo ID.
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inscricaoRepository.deleteById(id);
    }
}
