package com.medpro.medpro.model.dto;

import jakarta.validation.constraints.NotNull;

public record DadosCancelamentoConsulta(
        @NotNull Long consultaId,
        String motivoCancelamento
) {}
