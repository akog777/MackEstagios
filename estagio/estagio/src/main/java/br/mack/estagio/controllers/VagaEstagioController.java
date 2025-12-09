// Controller para gerenciar operações relacionadas a Vagas de Estágio.
// Inclui listagem pública, criação por empresas, encerramento de vagas.
package br.mack.estagio.controllers;

import br.mack.estagio.entities.*;
import br.mack.estagio.repositories.VagaEstagioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vagas-estagio")
@CrossOrigin(origins = "http://localhost:3000")
public class VagaEstagioController {

    @Autowired
    private VagaEstagioRepository vagaEstagioRepository;

    // Retorna TODAS as vagas (abertas e encerradas) - Apenas para ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<VagaEstagio> getAll() {
        return vagaEstagioRepository.findAll();
    }

    // Retorna uma vaga específica pelo ID.
    @GetMapping("/{id}")
    public VagaEstagio getById(@PathVariable Long id) {
        return vagaEstagioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaga não encontrada"));
    }

    // Retorna uma lista de vagas de estágio abertas.
    @GetMapping("/abertas")
    public List<VagaEstagio> getAbertas() {
        return vagaEstagioRepository.findByAbertaTrue();
    }

    // Retorna vagas abertas filtradas por áreas de interesse.
    @GetMapping("/por-areas")
    public List<VagaEstagio> getByAreas(@RequestParam List<Long> areaIds) {
        List<AreaInteresse> areas = areaIds.stream().map(id -> {
            AreaInteresse area = new AreaInteresse();
            area.setId(id);
            return area;
        }).toList();
        return vagaEstagioRepository.findByAreaInAndAbertaTrue(areas);
    }

    // Retorna vagas de uma empresa específica.
    @GetMapping("/empresa/{empresaId}")
    public List<VagaEstagio> getByEmpresa(@PathVariable Long empresaId) {
        Empresa empresa = new Empresa();
        empresa.setId(empresaId);
        return vagaEstagioRepository.findByEmpresa(empresa);
    }

    // Cria uma nova vaga de estágio. Requer role EMPRESA.
    @PostMapping
    public VagaEstagio create(@RequestBody VagaEstagio vagaEstagio) {
        return vagaEstagioRepository.save(vagaEstagio);
    }

    // Atualiza uma vaga de estágio existente.
    @PutMapping("/{id}")
    public VagaEstagio update(@PathVariable Long id, @RequestBody VagaEstagio vagaEstagio) {
        vagaEstagio.setId(id);
        return vagaEstagioRepository.save(vagaEstagio);
    }

    // Deleta uma vaga de estágio pelo ID.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        vagaEstagioRepository.deleteById(id);
    }

    // Encerra uma vaga de estágio, impedindo novas inscrições.
    @PutMapping("/{id}/encerrar")
    public VagaEstagio encerrar(@PathVariable Long id) {
        VagaEstagio vaga = vagaEstagioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaga não encontrada"));
        vaga.setAberta(false);
        return vagaEstagioRepository.save(vaga);
    }
}