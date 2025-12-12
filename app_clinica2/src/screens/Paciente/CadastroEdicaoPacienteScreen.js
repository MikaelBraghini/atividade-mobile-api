// src/screens/Paciente/CadastroEdicaoPacienteScreen.js
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import PacienteForm from "../../components/PacienteForm";

const API_URL = "http://10.110.12.63:8080/pacientes";

const CadastroEdicaoPacienteScreen = ({ route, navigation }) => {
  const { paciente: pacienteParam, onGoBack } = route.params || {};
  const [pacienteFull, setPacienteFull] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Se for edição, precisamos buscar os dados completos (endereço) que não vêm na listagem
  useEffect(() => {
    if (pacienteParam?.id) {
      setLoadingDetails(true);
      fetch(`${API_URL}/${pacienteParam.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao carregar detalhes");
          return res.json();
        })
        .then((data) => {
          setPacienteFull(data);
        })
        .catch((err) => {
          console.error(err);
          Alert.alert(
            "Erro",
            "Não foi possível carregar os dados do paciente."
          );
          navigation.goBack();
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [pacienteParam]);

  const handleSave = async (dadosForm) => {
    setIsSaving(true);
    try {
      const isEditing = !!pacienteParam?.id;

      // Monta o payload conforme a API espera (Endereço aninhado)
      const payload = {
        id: isEditing ? pacienteParam.id : undefined, // ID só é necessário no PUT se o backend exigir no corpo, mas o DTO Atualizacao pede
        nome: dadosForm.nome,
        telefone: dadosForm.telefone,
        endereco: {
          logradouro: dadosForm.logradouro,
          bairro: dadosForm.bairro,
          cep: dadosForm.cep,
          cidade: dadosForm.cidade,
          uf: dadosForm.uf,
          numero: dadosForm.numero,
          complemento: dadosForm.complemento,
        },
      };

      // Adiciona campos que só podem ser enviados no Cadastro (POST)
      if (!isEditing) {
        payload.email = dadosForm.email;
        payload.cpf = dadosForm.cpf;
      }

      // Configuração da requisição
      const method = isEditing ? "PUT" : "POST";
      // NOTA: No seu Controller, o PUT é em /pacientes (recebe ID no corpo), não /pacientes/{id}
      const url = API_URL;

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Operação realizada com sucesso!");
        if (onGoBack) onGoBack();
        navigation.goBack();
      } else {
        const errorText = await response.text();
        // Tenta parsear erro do Spring (ex: validação)
        try {
          const errorJson = JSON.parse(errorText);
          // Se for lista de erros (Bean Validation)
          if (Array.isArray(errorJson)) {
            const msgs = errorJson
              .map((e) => `${e.campo}: ${e.mensagem}`)
              .join("\n");
            Alert.alert("Erro de Validação", msgs);
          } else if (errorJson.message) {
            Alert.alert("Erro", errorJson.message);
          } else {
            Alert.alert("Erro", errorText);
          }
        } catch {
          Alert.alert("Erro", "Ocorreu um erro na requisição.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingDetails || isSaving) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PacienteForm
        // Usa o paciente completo (com endereço) se existir, senão usa o parametro, senão null
        paciente={pacienteFull || pacienteParam}
        onSave={handleSave}
        onCancel={() => navigation.goBack()}
        navigation={navigation}
      />
    </View>
  );
};

export default CadastroEdicaoPacienteScreen;
