package br.mack.estagio.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro que extrai o token JWT do cabeçalho Authorization (Bearer ...) e popula
 * o SecurityContext com uma Authentication contendo a role presente no token.
 *
 * Implementação mínima: valida token via JwtProvider, extrai o claim "role"
 * e cria uma autoridade com prefixo ROLE_.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                // Valida o token e popula a Authentication com a role encontrada.
                // Observações importantes:
                // - O token deve ser validado (assinatura + expiração) pelo JwtProvider.
                // - O claim "role" é convertido para uma autoridade com prefixo "ROLE_"
                //   para que o Spring Security possa avaliar `hasRole('EMPRESA')` etc.
                // - Caso o token seja inválido, não lançamos exceção aqui: apenas
                //   não autênticamos a requisição (segue como anonymous) e deixamos
                //   o fluxo de autorização lidar com a falta de Authentication.
                if (jwtProvider.validateToken(token)) {
                    String role = jwtProvider.getRoleFromToken(token);
                    if (role != null) {
                        String authority = "ROLE_" + role.toUpperCase();
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(jwtProvider.getUserIdFromToken(token), null,
                                        Collections.singletonList(new SimpleGrantedAuthority(authority)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ex) {
                // Em caso de token inválido, não autentica — segue como anonymous.
                // Se necessário, aqui poderíamos registrar detalhes para auditoria, mas
                // evitamos expor informações sensíveis nos logs.
            }
        }

        filterChain.doFilter(request, response);
    }
}
