package com.medpro.medpro.model.dto;

import com.medpro.medpro.model.entity.Paciente;

public record DadosDetalhamentoPaciente(
        Long id,
        String nome,
        String email,
        String cpf,
        String telefone,
        Boolean ativo,
        DadosEndereco endereco
) {
    public DadosDetalhamentoPaciente(Paciente paciente) {
        this(
                paciente.getId(),
                paciente.getNome(),
                paciente.getEmail(),
                paciente.getCpf(),
                paciente.getTelefone(),
                paciente.getAtivo(),
                new DadosEndereco(paciente.getEndereco())
        );
    }
}
