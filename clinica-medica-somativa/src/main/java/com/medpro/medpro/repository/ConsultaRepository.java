package com.medpro.medpro.repository;

import com.medpro.medpro.model.entity.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    boolean existsByMedicoIdAndDataHoraAndSituacaoNot(Long medicoId, LocalDateTime dataHora, String situacao);

    boolean existsByPacienteIdAndDataHoraAndSituacaoNot(Long pacienteId, LocalDateTime dataHora, String situacao);

    // Método para validar se paciente já tem consulta no dia (independente do horário exato)
    boolean existsByPacienteIdAndDataHoraBetweenAndSituacaoNot(Long pacienteId, LocalDateTime primeiroHorario, LocalDateTime ultimoHorario, String situacao);
}