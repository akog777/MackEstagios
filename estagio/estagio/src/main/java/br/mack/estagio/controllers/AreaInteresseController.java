// Controller para gerenciar operações relacionadas a Áreas de Interesse.
// Apenas administradores podem criar, editar e remover áreas.
package br.mack.estagio.controllers;

import br.mack.estagio.entities.AreaInteresse;
import br.mack.estagio.repositories.AreaInteresseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/areas-interesse")
@CrossOrigin(origins = "http://localhost:3000")
public class AreaInteresseController {

    @Autowired
    private AreaInteresseRepository areaInteresseRepository;

    // Retorna uma lista de todas as áreas de interesse cadastradas.
    @GetMapping
    public List<AreaInteresse> getAll() {
        return areaInteresseRepository.findAll();
    }

    // Cria uma nova área de interesse. Requer role ADMIN.
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AreaInteresse create(@RequestBody AreaInteresse areaInteresse) {
        return areaInteresseRepository.save(areaInteresse);
    }

    // Atualiza uma área de interesse existente. Requer role ADMIN.
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AreaInteresse update(@PathVariable Long id, @RequestBody AreaInteresse areaInteresse) {
        areaInteresse.setId(id);
        return areaInteresseRepository.save(areaInteresse);
    }

    // Deleta uma área de interesse pelo ID. Requer role ADMIN.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        areaInteresseRepository.deleteById(id);
    }
}
