CREATE TABLE consultas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  medico_id BIGINT NOT NULL,
  paciente_id BIGINT NOT NULL,
  data_hora DATETIME NOT NULL,
  motivo VARCHAR(255),
  motivo_cancelamento VARCHAR(255),
  situacao VARCHAR(20) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_consulta_medico FOREIGN KEY (medico_id) REFERENCES medicos(id),
  CONSTRAINT fk_consulta_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);
