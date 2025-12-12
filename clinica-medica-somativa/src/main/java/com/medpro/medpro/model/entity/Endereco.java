package com.medpro.medpro.model.entity;

import com.medpro.medpro.model.dto.DadosEndereco;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    private String logradouro;
    private String bairro;
    private String cep;
    private String cidade;
    private String uf;
    private String numero;
    private String complemento;

    public Endereco(DadosEndereco dados) {
        this.logradouro = dados.logradouro();
        this.bairro = dados.bairro();
        this.cep = dados.cep();
        this.cidade = dados.cidade();
        this.uf = dados.uf();
        this.numero = dados.numero();
        this.complemento = dados.complemento();
    }

    public void atualizarInformacoes(DadosEndereco dados) {
        if (dados.logradouro() != null) {
            if (dados.logradouro().isBlank())
                throw new IllegalArgumentException("Logradouro não pode estar em branco.");
            else
                this.logradouro = dados.logradouro();
        }
        if (dados.bairro() != null) {
            if (bairro.isBlank())
                throw new IllegalArgumentException("Bairro não pode estar em branco.");
            else
                this.bairro = dados.bairro();
        }
        if (dados.cep() != null) {
            if (cep.isBlank())
                throw new IllegalArgumentException("CEP não pode estar em branco.");
            else
                this.cep = dados.cep();
        }
        if (dados.cidade() != null) {
            if (cidade.isBlank())
                throw new IllegalArgumentException("Cidade não pode estar em branco.");
            else
                this.cidade = dados.cidade();
        }
        if (dados.uf() != null) {
            if (uf.isBlank())
                throw new IllegalArgumentException("UF não pode estar em branco.");
            else
                this.uf = dados.uf();
        }
        if (dados.numero() != null) {
            this.numero = dados.numero();
        }
        if (dados.complemento() != null) {
            this.complemento = dados.complemento();
        }
    }
}