/**
 * Controller responsável pela autenticação de usuários.
 * 
 * Funcionalidades:
 * - Validar credenciais (email e senha criptografada)
 * - Gerar JWT token para sessão segura
 * - Suportar autenticação para 3 tipos de usuários: estudante, empresa e admin
 * - Retornar dados do usuário após login bem-sucedido
 */
// Controller para autenticação de usuários.
// Suporta login para estudantes, empresas e administradores com JWT.
package br.mack.estagio.controllers;

import br.mack.estagio.dto.*;
import br.mack.estagio.entities.*;
import br.mack.estagio.repositories.*;
import br.mack.estagio.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private EstudanteRepository estudanteRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private AdministradorRepository administradorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    /**
     * Endpoint de login que autentica um usuário e retorna JWT.
     * 
     * Fluxo:
     * 1. Recebe email, senha e tipo de usuário
     * 2. Busca usuário no banco de dados correspondente
     * 3. Valida senha com BCrypt
     * 4. Gera JWT token com expiração de 24h
     * 5. Retorna token e informações do usuário
     * 
     * @param request Email, senha e role (estudante/empresa/admin)
     * @return LoginResponse com token JWT, role, ID e nome do usuário
     * @throws ResponseStatusException 401 se credenciais inválidas
     */
    // Endpoint de login que verifica credenciais e retorna JWT.
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        String email = request.getEmail();
        String senha = request.getSenha();
        String role = request.getRole();

        // Verifica credenciais baseado no tipo de usuário
        switch (role.toLowerCase()) {
            case "estudante":
                Estudante estudante = estudanteRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
                if (!passwordEncoder.matches(senha, estudante.getSenha())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
                }
                LoginResponse response = new LoginResponse();
                response.setToken(jwtProvider.generateToken(estudante.getId(), estudante.getEmail(), role));
                response.setRole(role);
                response.setId(estudante.getId());
                response.setNome(estudante.getNome());
                return response;

            case "empresa":
                Empresa empresa = empresaRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
                if (!passwordEncoder.matches(senha, empresa.getSenha())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
                }
                LoginResponse response2 = new LoginResponse();
                response2.setToken(jwtProvider.generateToken(empresa.getId(), empresa.getEmail(), role));
                response2.setRole(role);
                response2.setId(empresa.getId());
                response2.setNome(empresa.getNome());
                return response2;

            case "admin":
                Administrador admin = administradorRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
                if (!passwordEncoder.matches(senha, admin.getSenha())) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
                }
                LoginResponse response3 = new LoginResponse();
                response3.setToken(jwtProvider.generateToken(admin.getId(), admin.getEmail(), role));
                response3.setRole(role);
                response3.setId(admin.getId());
                response3.setNome(admin.getNome());
                return response3;

            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de usuário inválido");
        }
    }
}
