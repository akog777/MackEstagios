// Controller para gerenciar operações relacionadas a Administradores.
// Fornece endpoints para CRUD de administradores, incluindo criptografia de senha.
package br.mack.estagio.controllers;

import br.mack.estagio.dto.CadastroEmpresaRequest;
import br.mack.estagio.entities.Administrador;
import br.mack.estagio.repositories.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/administradores")
@CrossOrigin(origins = "http://localhost:3000")
public class AdministradorController {

    @Autowired
    private AdministradorRepository administradorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Retorna uma lista de todos os administradores cadastrados.
    @GetMapping
    public List<Administrador> getAll() {
        return administradorRepository.findAll();
    }

    // Cria um novo administrador. Criptografa a senha.
    @PostMapping
    public Administrador create(@RequestBody Administrador administrador) {
        administrador.setSenha(passwordEncoder.encode(administrador.getSenha()));
        return administradorRepository.save(administrador);
    }

    // Atualiza um administrador existente. Criptografa a senha se fornecida.
    @PutMapping("/{id}")
    public Administrador update(@PathVariable Long id, @RequestBody Administrador administrador) {
        administrador.setId(id);
        Administrador existing = administradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado."));
        // Criptografar senha se fornecida
        if (administrador.getSenha() != null && !administrador.getSenha().isEmpty()) {
            administrador.setSenha(passwordEncoder.encode(administrador.getSenha()));
        } else {
            administrador.setSenha(existing.getSenha());
        }
        return administradorRepository.save(administrador);
    }

    // Deleta um administrador pelo ID.
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        administradorRepository.deleteById(id);
    }

    // Endpoint de registro simplificado para admin.
    @PostMapping("/registro")
    public Administrador register(@RequestBody CadastroEmpresaRequest request) {
        Administrador admin = new Administrador();
        admin.setNome(request.getNome());
        admin.setEmail(request.getEmail());
        admin.setSenha(passwordEncoder.encode(request.getSenha()));
        return administradorRepository.save(admin);
    }
}
