// src/screens/Medico/CadastroEdicaoMedicoScreen.js
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, Platform } from "react-native";
import MedicoForm from "../../components/MedicoForm";

const API_URL = "http://10.110.12.63:8080/medicos";

const CadastroEdicaoMedicoScreen = ({ route, navigation }) => {
  const { medico: medicoParam, onGoBack } = route.params || {};
  const [medicoFull, setMedicoFull] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Busca detalhes se for edição (para ter o endereço completo)
  useEffect(() => {
    if (medicoParam?.id) {
      setLoadingDetails(true);
      fetch(`${API_URL}/${medicoParam.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Falha ao buscar detalhes");
          return res.json();
        })
        .then((data) => setMedicoFull(data))
        .catch((err) => {
          console.error(err);
          if (Platform.OS !== "web")
            Alert.alert("Erro", "Falha ao carregar dados do médico.");
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [medicoParam]);

  const handleSave = async (dadosForm) => {
    setIsSaving(true);
    try {
      const isEditing = !!medicoParam?.id;

      const payload = {
        id: isEditing ? medicoParam.id : undefined,
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

      // Campos que só são enviados no cadastro (POST)
      if (!isEditing) {
        payload.email = dadosForm.email;
        payload.crm = dadosForm.crm;
        payload.especialidade = dadosForm.especialidade; // Deve corresponder ao Enum no backend
      }

      const method = isEditing ? "PUT" : "POST";
      // PUT na raiz (/medicos) conforme seu controller
      const url = API_URL;

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (Platform.OS === "web") window.alert("Salvo com sucesso!");
        else Alert.alert("Sucesso", "Operação realizada com sucesso!");

        if (onGoBack) onGoBack();
        navigation.goBack();
      } else {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          if (Array.isArray(errorJson)) {
            // Erros de validação do Spring (Bean Validation)
            const msgs = errorJson
              .map((e) => `${e.campo || "Erro"}: ${e.mensagem}`)
              .join("\n");
            if (Platform.OS !== "web") Alert.alert("Validação", msgs);
            else console.log(msgs);
          } else {
            if (Platform.OS !== "web")
              Alert.alert("Erro", errorJson.message || errorText);
          }
        } catch {
          if (Platform.OS !== "web")
            Alert.alert("Erro", "Ocorreu um erro na requisição.");
        }
      }
    } catch (error) {
      console.error(error);
      if (Platform.OS !== "web")
        Alert.alert("Erro", "Não foi possível salvar.");
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
      <MedicoForm
        medico={medicoFull || medicoParam}
        onSave={handleSave}
        onCancel={() => navigation.goBack()}
        navigation={navigation}
      />
    </View>
  );
};

export default CadastroEdicaoMedicoScreen;
