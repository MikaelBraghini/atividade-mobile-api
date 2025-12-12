package com.medpro.medpro.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultas")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Consulta {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    private LocalDateTime dataHora;

    @Column(name = "motivo")
    private String motivoConsulta;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    private String situacao;

    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        this.criadoEm = LocalDateTime.now();
    }

    public void cancelar(String motivo) {
        this.situacao = "CANCELADA";
        this.motivoCancelamento = motivo;
    }

    public void agendar(LocalDateTime dataHora, String motivo) {
        this.dataHora = dataHora;
        this.motivoConsulta = motivo;
        this.situacao = "AGENDADA";
    }
}