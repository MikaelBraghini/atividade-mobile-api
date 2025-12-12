package com.medpro.medpro.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DadosCadastroPaciente(
        @NotBlank String nome,
        @NotBlank String email,
        @NotBlank String cpf,
        @NotBlank String telefone,
        @NotNull DadosEndereco endereco
) {}
