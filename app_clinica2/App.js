import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importações das telas
import Splash from "./src/screens/Splash/Splash";
import MenuScreen from "./src/screens/Menu/MenuScreen";
import Medico from "./src/screens/Medico/Medico";
import CadastroEdicaoMedicoScreen from "./src/screens/Medico/CadastroEdicaoMedicoScreen";
import Paciente from "./src/screens/Paciente/Paciente";
import CadastroEdicaoPacienteScreen from "./src/screens/Paciente/CadastroEdicaoPacienteScreen"; // NOVA IMPORTAÇÃO
import Consulta from "./src/screens/Consulta/Consulta";
import AgendamentoConsultaScreen from "./src/screens/Consulta/AgendamentoConsultaScreen";

const Stack = createStackNavigator();
const API_URL_MEDICO =
  "https://693358d7e5a9e342d2728c31.mockapi.io/clinica/medico";

function App() {
  const [medicos, setMedicos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar médicos na API
  const fetchMedicos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL_MEDICO);
      if (!response.ok) throw new Error("Erro na resposta da API");
      const data = await response.json();
      setMedicos(data);
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicos();
  }, [fetchMedicos]);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ headerShown: false }}
        />

        {/* --- MÉDICOS --- */}
        <Stack.Screen name="Medicos" options={{ title: "Médico(a)s" }}>
          {(props) => (
            <Medico
              {...props}
              medicos={medicos}
              onRefresh={fetchMedicos}
              loading={isLoading}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="CadastroEdicaoMedico"
          component={CadastroEdicaoMedicoScreen}
          options={{ title: "Gerenciar Médico" }}
        />

        {/* --- PACIENTES (NOVAS ROTAS) --- */}
        <Stack.Screen
          name="Pacientes"
          component={Paciente}
          options={{ title: "Pacientes" }}
        />

        <Stack.Screen
          name="CadastroEdicaoPaciente"
          component={CadastroEdicaoPacienteScreen}
          options={{ title: "Gerenciar Paciente" }}
        />

        {/* --- CONSULTAS --- */}
        <Stack.Screen
          name="Consultas"
          component={Consulta}
          options={{ title: "Consultas" }}
        />

        <Stack.Screen
          name="AgendamentoConsulta"
          component={AgendamentoConsultaScreen}
          options={{ title: "Nova Consulta" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
