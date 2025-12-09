// Controller para gerenciar operações relacionadas a Estudantes.
// Fornece endpoints para CRUD de estudantes, incluindo validações de unicidade de CPF e email,
// criptografia de senha e funcionalidades de gamificação.
package br.mack.estagio.controllers;

import br.mack.estagio.dto.CadastroEstudanteRequest;
import br.mack.estagio.entities.Estudante;
import br.mack.estagio.repositories.EstudanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/estudantes")
@CrossOrigin(origins = "http://localhost:3000")
public class EstudanteController {

    @Autowired
    private EstudanteRepository estudanteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Retorna uma lista de todos os estudantes cadastrados.
    @GetMapping
    public List<Estudante> getAll() {
        return estudanteRepository.findAll();
    }

    // Retorna um estudante específico pelo ID.
    @GetMapping("/{id}")
    public Estudante getById(@PathVariable Long id) {
        return estudanteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado."));
    }

    // Cria um novo estudante. Valida unicidade de CPF e email, criptografa a senha.
    @PostMapping
    public Estudante create(@RequestBody Estudante estudante) {
        if (estudanteRepository.findByCpf(estudante.getCpf()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF já cadastrado.");
        }
        if (estudanteRepository.findByEmail(estudante.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado.");
        }
        estudante.setSenha(passwordEncoder.encode(estudante.getSenha()));
        return estudanteRepository.save(estudante);
    }

    // Endpoint de registro simplificado.
    @PostMapping("/registro")
    public Estudante register(@RequestBody CadastroEstudanteRequest request) {
        if (estudanteRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }
        
        Estudante estudante = new Estudante();
        estudante.setNome(request.getNome());
        estudante.setCpf(request.getCpf());
        estudante.setCurso(request.getCurso());
        estudante.setEmail(request.getEmail());
        estudante.setTelefone(request.getTelefone());
        estudante.setSenha(passwordEncoder.encode(request.getSenha()));
        
        return estudanteRepository.save(estudante);
    }

    // Atualiza um estudante existente. Valida unicidade de CPF e email, criptografa a senha se fornecida.
    @PutMapping("/{id}")
    public Estudante update(@PathVariable Long id, @RequestBody Estudante estudante) {
        estudante.setId(id);
        Estudante existing = estudanteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado."));
        if (!existing.getCpf().equals(estudante.getCpf()) && estudanteRepository.findByCpf(estudante.getCpf()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF já cadastrado.");
        }
        if (!existing.getEmail().equals(estudante.getEmail()) && estudanteRepository.findByEmail(estudante.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado.");
        }
        // Criptografar senha se fornecida
        if (estudante.getSenha() != null && !estudante.getSenha().isEmpty()) {
            estudante.setSenha(passwordEncoder.encode(estudante.getSenha()));
        } else {
            estudante.setSenha(existing.getSenha());
        }
        return estudanteRepository.save(estudante);
    }

    // Deleta um estudante pelo ID.
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        estudanteRepository.deleteById(id);
    }

    // Endpoints para gamificação
    // Retorna o top 10 estudantes por pontos (gamificação).
    @GetMapping("/gamificacao/top10")
    public List<Estudante> getTop10ByPontos() {
        return estudanteRepository.findTop10ByOrderByPontosDesc();
    }

    // Retorna estudantes que possuem uma badge específica (gamificação).
    @GetMapping("/gamificacao/badges/{badge}")
    public List<Estudante> getByBadge(@PathVariable String badge) {
        return estudanteRepository.findByBadgesContaining(badge);
    }

    // Adiciona pontos a um estudante e concede badges automaticamente (gamificação).
    @PostMapping("/{id}/pontos")
    public Estudante addPontos(@PathVariable Long id, @RequestParam Integer pontos) {
        Estudante estudante = estudanteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado."));
        estudante.setPontos(estudante.getPontos() + pontos);
        if (estudante.getPontos() >= 10 && !estudante.getBadges().contains("Iniciante")) {
            estudante.getBadges().add("Iniciante");
        }
        if (estudante.getPontos() >= 50 && !estudante.getBadges().contains("Avançado")) {
            estudante.getBadges().add("Avançado");
        }
        return estudanteRepository.save(estudante);
    }

    // Adiciona uma badge a um estudante (gamificação).
    @PostMapping("/{id}/badges")
    public Estudante addBadge(@PathVariable Long id, @RequestParam String badge) {
        Estudante estudante = estudanteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado."));
        estudante.getBadges().add(badge);
        return estudanteRepository.save(estudante);
    }
}
