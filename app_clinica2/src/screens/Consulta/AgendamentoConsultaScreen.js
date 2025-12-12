// src/screens/Consulta/AgendamentoConsultaScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

const API_URL = "http://10.110.12.63:8080/consultas";

const AgendamentoConsultaScreen = ({ navigation }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: "",
    medicoId: "",
    especialidade: "",
    dataHora: "", // Formato esperado: YYYY-MM-DDTHH:mm:ss
    motivoConsulta: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.pacienteId || !formData.dataHora) {
      Alert.alert("Erro", "Paciente e Data/Hora são obrigatórios.");
      return;
    }
    if (!formData.medicoId && !formData.especialidade) {
      Alert.alert("Erro", "Informe o Médico (ID) OU a Especialidade.");
      return;
    }

    setIsSaving(true);
    try {
      // Prepara o payload
      const payload = {
        pacienteId: parseInt(formData.pacienteId),
        dataHora: formData.dataHora,
        motivoConsulta: formData.motivoConsulta,
      };

      // Lógica: Médico ID tem prioridade, senão manda especialidade
      if (formData.medicoId) {
        payload.medicoId = parseInt(formData.medicoId);
      } else {
        payload.especialidade = formData.especialidade.toUpperCase();
      }

      console.log("Enviando agendamento:", payload);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (Platform.OS === "web") window.alert("Consulta agendada!");
        else Alert.alert("Sucesso", "Consulta agendada com sucesso!");
        navigation.goBack();
      } else {
        const errorText = await response.text();
        // Tenta ler erro JSON do Spring
        try {
          const errJson = JSON.parse(errorText);
          const msg = errJson.message || errorText;
          if (Platform.OS === "web") window.alert(`Erro: ${msg}`);
          else Alert.alert("Não foi possível agendar", msg);
        } catch {
          Alert.alert("Erro", errorText);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Agendar Consulta</Text>

        <Text style={styles.label}>ID do Paciente *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 1"
          keyboardType="numeric"
          value={formData.pacienteId}
          onChangeText={(t) => handleChange("pacienteId", t)}
        />

        <Text style={styles.label}>Data e Hora (AAAA-MM-DDTHH:mm:ss) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2025-12-25T10:00:00"
          value={formData.dataHora}
          onChangeText={(t) => handleChange("dataHora", t)}
        />

        <View style={styles.divider} />
        <Text style={styles.subTitle}>Selecione o Médico OU Especialidade</Text>

        <Text style={styles.label}>ID do Médico (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 1"
          keyboardType="numeric"
          value={formData.medicoId}
          onChangeText={(t) => handleChange("medicoId", t)}
        />

        <Text style={styles.label}>Especialidade (Se não escolher médico)</Text>
        <TextInput
          style={styles.input}
          placeholder="ORTOPEDIA, CARDIOLOGIA..."
          autoCapitalize="characters"
          value={formData.especialidade}
          onChangeText={(t) => handleChange("especialidade", t)}
        />

        <View style={styles.divider} />
        <Text style={styles.label}>Motivo (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Dor de cabeça recorrente"
          value={formData.motivoConsulta}
          onChangeText={(t) => handleChange("motivoConsulta", t)}
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Confirmar Agendamento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  label: { fontSize: 14, marginBottom: 5, fontWeight: "500", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    height: 45,
    marginBottom: 15,
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: { backgroundColor: "#007AFF" },
  cancelButton: { backgroundColor: "#6c757d" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default AgendamentoConsultaScreen;
