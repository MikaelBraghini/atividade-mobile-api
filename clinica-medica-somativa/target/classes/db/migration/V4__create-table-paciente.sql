create table pacientes (
    id bigint not null auto_increment,
    cpf varchar(14) not null unique,
    nome varchar(100) not null,
    email varchar(100) not null unique,
    telefone varchar(20) not null,
    -- Campos do endereço (Embedded)
    logradouro varchar(100) not null,
    bairro varchar(100) not null,
    cep varchar(9) not null,
    cidade varchar(100) not null,
    uf char(2) not null,
    numero varchar(20),
    complemento varchar(100),
    ativo tinyint(1) not null,

    primary key(id)
);
