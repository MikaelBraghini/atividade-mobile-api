package com.medpro.medpro.controller;

import com.medpro.medpro.model.dto.DadosAgendamentoConsulta;
import com.medpro.medpro.model.dto.DadosCancelamentoConsulta;
import com.medpro.medpro.model.dto.DadosDetalhamentoConsulta;
import com.medpro.medpro.model.dto.DadosListagemConsulta;
import com.medpro.medpro.model.entity.Consulta;
import com.medpro.medpro.model.entity.Medico;
import com.medpro.medpro.repository.ConsultaRepository;
import com.medpro.medpro.repository.MedicoRepository;
import com.medpro.medpro.repository.PacienteRepository;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/consultas")
public class ConsultaController {

    private final ConsultaRepository consultaRepo;
    private final MedicoRepository medicoRepo;
    private final PacienteRepository pacienteRepo;

    public ConsultaController(ConsultaRepository consultaRepo, MedicoRepository medicoRepo, PacienteRepository pacienteRepo) {
        this.consultaRepo = consultaRepo;
        this.medicoRepo = medicoRepo;
        this.pacienteRepo = pacienteRepo;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> agendar(@RequestBody @Valid DadosAgendamentoConsulta dados, UriComponentsBuilder uriBuilder) {
        
        // --- 1. Validações de Horário ---

        // Regra: Consultas com duração de 1h, funcionamento das 07:00 às 19:00
        // Portanto, a última consulta pode começar às 18:00 (para acabar as 19:00)
        var dataConsulta = dados.dataHora();
        var horaConsulta = dataConsulta.toLocalTime();
        var abertura = LocalTime.of(7, 0);
        var encerramento = LocalTime.of(18, 0);

        if (horaConsulta.isBefore(abertura) || horaConsulta.isAfter(encerramento)) {
            return ResponseEntity.badRequest().body("Consulta fora do horário de funcionamento (07:00 às 19:00).");
        }

        // Regra: Funcionamento de Segunda a Sábado (domingo fechado)
        var domingo = dataConsulta.getDayOfWeek().equals(DayOfWeek.SUNDAY);
        if (domingo) {
            return ResponseEntity.badRequest().body("A clínica não funciona aos domingos.");
        }

        // Regra: Antecedência mínima de 30 minutos
        var agora = LocalDateTime.now();
        var diferencaEmMinutos = Duration.between(agora, dataConsulta).toMinutes();
        if (diferencaEmMinutos < 30) {
            return ResponseEntity.badRequest().body("A consulta deve ser agendada com no mínimo 30 minutos de antecedência.");
        }

        // --- 2. Validações de Paciente ---
        
        var paciente = pacienteRepo.findById(dados.pacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado")); // Ou tratar com ResponseEntity

        // Regra: Paciente inativo
        if (!paciente.getAtivo()) {
            return ResponseEntity.badRequest().body("Consulta não pode ser agendada com paciente inativo.");
        }

        // Regra: Não permitir mais de uma consulta no mesmo dia para o mesmo paciente
        var primeiroHorario = dataConsulta.withHour(7).withMinute(0).withSecond(0);
        var ultimoHorario = dataConsulta.withHour(18).withMinute(0).withSecond(0);
        if (consultaRepo.existsByPacienteIdAndDataHoraBetweenAndSituacaoNot(paciente.getId(), primeiroHorario, ultimoHorario, "CANCELADA")) {
            return ResponseEntity.badRequest().body("Paciente já possui uma consulta agendada para esse dia.");
        }
        
        // --- 3. Escolha e Validação do Médico ---

        Medico medico;

        if (dados.medicoId() != null) {
            // Médico escolhido pelo usuário
            medico = medicoRepo.findById(dados.medicoId())
                    .orElseThrow(() -> new RuntimeException("Médico não encontrado"));

            // Regra: Médico inativo
            if (!medico.isAtivo()) {
                return ResponseEntity.badRequest().body("Consulta não pode ser agendada com médico inativo.");
            }

            // Regra: Médico já possui consulta nessa hora
            if (consultaRepo.existsByMedicoIdAndDataHoraAndSituacaoNot(medico.getId(), dataConsulta, "CANCELADA")) {
                return ResponseEntity.badRequest().body("Médico já possui outra consulta agendada nesse mesmo horário.");
            }

        } else {
            // Regra: Escolha aleatória de médico
            if (dados.especialidade() == null) {
                return ResponseEntity.badRequest().body("Especialidade é obrigatória quando o médico não é escolhido.");
            }

            var medicoLivre = medicoRepo.escolherMedicoAleatorioLivreNaData(dados.especialidade(), dataConsulta);
            if (medicoLivre.isEmpty()) {
                return ResponseEntity.badRequest().body("Não existe médico disponível para essa especialidade nessa data/hora.");
            }
            medico = medicoLivre.get();
        }

        // --- 4. Salvar Consulta ---

        var consulta = new Consulta();
        consulta.setMedico(medico);
        consulta.setPaciente(paciente);
        consulta.setDataHora(dataConsulta);
        consulta.setSituacao("AGENDADA");
        consulta.setMotivoConsulta(dados.motivoConsulta()); // Se tiver no DTO

        consultaRepo.save(consulta);

        var uri = uriBuilder.path("/consultas/{id}").buildAndExpand(consulta.getId()).toUri();
        return ResponseEntity.created(uri).body(new DadosDetalhamentoConsulta(consulta));
    }

    // --- Demais métodos (Cancelamento, Listagem, Get) ---

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> cancelar(@PathVariable Long id, @RequestBody(required = false) DadosCancelamentoConsulta dados) {
        var consulta = consultaRepo.findById(id).orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        // Regra: Antecedência de cancelamento (ex: 24h)
        var agora = LocalDateTime.now();
        var diferencaEmHoras = Duration.between(agora, consulta.getDataHora()).toHours();

        if (diferencaEmHoras < 24) {
            return ResponseEntity.badRequest().body("Consulta só pode ser cancelada com antecedência mínima de 24h.");
        }

        // Regra: Situação 'AGENDADA'
        if (!"AGENDADA".equals(consulta.getSituacao())) {
            return ResponseEntity.badRequest().body("Apenas consultas agendadas podem ser canceladas.");
        }
        
        var motivo = (dados != null) ? dados.motivoCancelamento() : null;
        consulta.cancelar(motivo);
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping
    public ResponseEntity<Page<DadosListagemConsulta>> listar(@PageableDefault(size = 10, sort = {"dataHora"}) Pageable paginacao) {
        var page = consultaRepo.findAll(paginacao).map(c -> new DadosListagemConsulta(
                c.getId(), 
                c.getMedico().getId(), 
                c.getMedico().getNome(), 
                c.getPaciente().getId(), 
                c.getPaciente().getNome(), 
                c.getDataHora(), 
                c.getSituacao()));
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detalhar(@PathVariable Long id) {
        var consulta = consultaRepo.findById(id).orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        return ResponseEntity.ok(new DadosDetalhamentoConsulta(consulta));
    }
}