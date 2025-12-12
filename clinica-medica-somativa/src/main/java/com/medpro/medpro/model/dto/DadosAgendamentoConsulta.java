package com.medpro.medpro.model.dto;

import com.medpro.medpro.enums.Especialidade;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DadosAgendamentoConsulta(
        Long medicoId,

        @NotNull
        Long pacienteId,

        @NotNull
        @Future
        LocalDateTime dataHora,

        Especialidade especialidade, // Adicionado para escolha aleatória

        String motivoConsulta
) {}