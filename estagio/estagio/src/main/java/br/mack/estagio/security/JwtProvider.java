package br.mack.estagio.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Provedor de JWT para autenticação segura.
 * Responsável por gerar, validar e extrair informações de tokens JWT.
 * 
 * Funcionalidades:
 * - Gerar tokens JWT com ID do usuário, email e role
 * - Validar tokens JWT
 * - Extrair informações (userID, email, role) de tokens válidos
 */
@Component
public class JwtProvider {

    @Value("${jwt.secret:minha_chave_secreta_muito_segura_para_estagio_2024}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private int jwtExpirationMs;

    /**
     * Gera um novo token JWT para um usuário.
     * 
     * @param userId ID único do usuário (estudante, empresa ou admin)
     * @param email Email do usuário para referência
     * @param role Tipo de usuário (estudante, empresa, admin)
     * @return Token JWT codificado e assinado
     */
    public String generateToken(Long userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("email", email);
        return createToken(claims, userId.toString());
    }

    /**
     * Cria o token JWT com claims, assinatura e expiração.
     * 
     * @param claims Dados a incluir no token (role, email, etc)
     * @param subject ID do usuário como subject do token
     * @return Token JWT compacto (Header.Payload.Signature)
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extrai o ID do usuário do token JWT.
     * 
     * @param token Token JWT válido
     * @return ID do usuário contido no subject do token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extrai o email do usuário do token JWT.
     * 
     * @param token Token JWT válido
     * @return Email armazenado nos claims do token
     */
    public String getEmailFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("email");
    }

    /**
     * Extrai o role (tipo) do usuário do token JWT.
     * 
     * @param token Token JWT válido
     * @return Role: "estudante", "empresa" ou "admin"
     */
    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (String) claims.get("role");
    }

    /**
     * Valida se um token JWT é legítimo e não expirou.
     * 
     * @param token Token JWT a validar
     * @return true se o token é válido, false se expirou ou foi alterado
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Token inválido, expirado ou mal formatado
            return false;
        }
    }

    /**
     * Extrai todos os claims (dados) de um token JWT validado.
     * 
     * @param token Token JWT válido
     * @return Claims contendo subject, email, role, datas de emissão e expiração
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
