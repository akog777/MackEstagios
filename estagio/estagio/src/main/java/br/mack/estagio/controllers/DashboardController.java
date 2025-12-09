/**
 * Controller responsável pelos dashboards personalizados de cada tipo de usuário.
 * 
 * Funcionalidades:
 * - Dashboard Admin: estatísticas gerais do portal
 * - Dashboard Estudante: vagas relacionadas a suas áreas de interesse
 * - Dashboard Empresa: vagas criadas e inscrições recebidas
 */
// Controller para dashboards personalizados.
// Fornece estatísticas para admin, vagas para estudantes e inscrições para empresas.
package br.mack.estagio.controllers;

import br.mack.estagio.entities.*;
import br.mack.estagio.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private EstudanteRepository estudanteRepository;

    @Autowired
    private VagaEstagioRepository vagaEstagioRepository;

    @Autowired
    private InscricaoRepository inscricaoRepository;

    /**
     * Retorna estatísticas gerais do portal para o administrador.
     * 
     * Dados fornecidos:
     * - Quantidade total de empresas cadastradas
     * - Quantidade total de estudantes cadastrados
     * - Quantidade de vagas abertas (ativas)
     * - Quantidade de vagas encerradas
     * - Distribuição de vagas por área de interesse
     * 
     * @return Map com estatísticas do portal
     */
    // Retorna estatísticas gerais do portal para administradores. Requer role ADMIN.
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmpresas", empresaRepository.count());
        stats.put("totalEstudantes", estudanteRepository.count());
        stats.put("vagasAbertas", vagaEstagioRepository.countByAbertaTrue());
        stats.put("vagasEncerradas", vagaEstagioRepository.countByAbertaFalse());
        stats.put("vagasPorArea", vagaEstagioRepository.countVagasByArea());
        return stats;
    }

    /**
     * Retorna as vagas abertas que correspondem às áreas de interesse do estudante.
     * 
     * Fluxo:
     * 1. Busca estudante pelo ID
     * 2. Obtém áreas de interesse do estudante
     * 3. Lista vagas abertas nessas áreas
     * 4. Ordena por ID decrescente (vagas mais recentes primeiro)
     * 
     * @param estudanteId ID do estudante logado
     * @return Lista de vagas relacionadas às suas áreas
     */
    // Retorna vagas abertas relacionadas às áreas de interesse do estudante.
    @GetMapping("/estudante/{estudanteId}")
    public List<VagaEstagio> getEstudanteDashboard(@PathVariable Long estudanteId) {
        return estudanteRepository.findById(estudanteId)
                .map(estudante -> vagaEstagioRepository.findByAreaInAndAbertaTrueOrderByIdDesc(List.copyOf(estudante.getAreasInteresse())))
                .orElse(List.of());
    }

    /**
     * Retorna o dashboard da empresa com suas vagas e inscrições recebidas.
     * 
     * Dados fornecidos:
     * - Todas as vagas criadas pela empresa (abertas e encerradas)
     * - Mapa com inscrições agrupadas por vaga
     * - Informações dos estudantes inscritos
     * 
     * @param empresaId ID da empresa logada
     * @return Map contendo "vagas" e "inscricoesPorVaga"
     */
    // Retorna vagas da empresa e inscrições por vaga para a empresa logada.
    @GetMapping("/empresa/{empresaId}")
    public Map<String, Object> getEmpresaDashboard(@PathVariable Long empresaId) {
        Map<String, Object> dashboard = new HashMap<>();
        List<VagaEstagio> vagas = vagaEstagioRepository.findByEmpresa_Id(empresaId);
        dashboard.put("vagas", vagas);
        Map<Long, List<Inscricao>> inscricoesPorVaga = new HashMap<>();
        for (VagaEstagio vaga : vagas) {
            List<Inscricao> inscricoes = inscricaoRepository.findByVagaId(vaga.getId());
            inscricoesPorVaga.put(vaga.getId(), inscricoes);
        }
        dashboard.put("inscricoesPorVaga", inscricoesPorVaga);
        return dashboard;
    }
}
