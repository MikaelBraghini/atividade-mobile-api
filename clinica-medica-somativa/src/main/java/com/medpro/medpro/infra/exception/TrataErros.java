package com.medpro.medpro.infra.exception;

import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class TrataErros {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Void> tratarErro404() {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<DadosErroValidacao>> trataErro400(MethodArgumentNotValidException e) {
        var erros = e.getFieldErrors();
        return ResponseEntity.badRequest().body(erros.stream().map(DadosErroValidacao::new).toList());
    }

    @ExceptionHandler(UnrecognizedPropertyException.class)
    public ResponseEntity<?> tratarCamposInvalidos(UnrecognizedPropertyException e) {
        var campo = e.getPropertyName();
        var erro = new ErroCampoInvalido(
                campo,
                "Campo inválido enviado: " + campo
        );
        return ResponseEntity.badRequest().body(erro);
    }

    private record ErroCampoInvalido(String campo, String mensagem) {}

    private record DadosErroValidacao(String campo, String mensagem) {
        private DadosErroValidacao(FieldError erro) {
            this(erro.getField(), erro.getDefaultMessage());
        }
    }
}
