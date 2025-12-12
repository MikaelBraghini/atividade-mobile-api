package com.medpro.medpro.model.dto;

import java.time.LocalDateTime;

public record DadosListagemConsulta(
        Long id,
        Long medicoId,
        String nomeMedico,
        Long pacienteId,
        String nomePaciente,
        LocalDateTime dataHora,
        String situacao
) {}
