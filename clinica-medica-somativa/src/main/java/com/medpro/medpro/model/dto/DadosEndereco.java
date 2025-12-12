package com.medpro.medpro.model.dto;

import com.medpro.medpro.model.entity.Endereco;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DadosEndereco(

        @NotBlank String logradouro,

        @NotBlank String bairro,

        @NotBlank @Pattern(regexp = "\\d{8}") String cep,

        @NotBlank String cidade,

        @NotBlank String uf,

        String numero,
        String complemento) {

    public DadosEndereco(Endereco endereco) {
        this(
                endereco.getLogradouro(),
                endereco.getBairro(),
                endereco.getCep(),
                endereco.getCidade(),
                endereco.getUf(),
                endereco.getNumero(),
                endereco.getComplemento()
        );
    }
}
