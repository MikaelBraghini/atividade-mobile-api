package com.medpro.medpro.model.dto;

import com.medpro.medpro.model.entity.Consulta;

import java.time.LocalDateTime;

public record DadosDetalhamentoConsulta(
        Long idConsulta,
        LocalDateTime dataHora,
        String situacao,
        String motivoConsulta,
        String motivoCancelamento,
        DadosDetalhamentoMedico medico,
        DadosDetalhamentoPaciente paciente
) {

    public DadosDetalhamentoConsulta(Consulta consulta) {
        this(
                consulta.getId(),
                consulta.getDataHora(),
                consulta.getSituacao(),
                consulta.getMotivoConsulta(),
                consulta.getMotivoCancelamento(),
                new DadosDetalhamentoMedico(consulta.getMedico()),
                new DadosDetalhamentoPaciente(consulta.getPaciente())
        );
    }
}
