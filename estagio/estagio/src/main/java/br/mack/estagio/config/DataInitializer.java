package br.mack.estagio.config;

import br.mack.estagio.entities.Administrador;
import br.mack.estagio.repositories.AdministradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializador opcional para criar um administrador padrão em ambiente de desenvolvimento.
 * Cria um admin com email `admin@test.com` e senha `admin123` se nenhum administrador existir.
 */
@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdministradorRepository administradorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (administradorRepository.count() == 0) {
            Administrador admin = new Administrador();
            admin.setNome("Administrador Padrão");
            admin.setEmail("admin@test.com");
            admin.setSenha(passwordEncoder.encode("admin123"));
            administradorRepository.save(admin);
        }
    }
}
