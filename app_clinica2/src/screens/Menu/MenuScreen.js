// src/screens/Menu/MenuScreen.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import BotaoMenu from "../../components/BotaoMenu";

// Importando assets
const Logo = require("../../../assets/logomin.png"); // Usei o logomin se tiver, senão use o logo.png normal
// Fallback caso não tenha o logomin
const LogoGrande = require("../../../assets/logo.png");

const IconeMedic = require("../../../assets/usuario-md.png");
const IconePaciente = require("../../../assets/utilizador.png");
const IconeConsulta = require("../../../assets/calendario.png");

const MenuScreen = ({ navigation }) => {
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      {/* --- Cabeçalho Azul --- */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo ao</Text>
            <Text style={styles.brandText}>MedPro</Text>
          </View>
          {/* Logo no canto superior direito */}
          <Image source={LogoGrande} style={styles.logoHeader} />
        </View>
        <Text style={styles.headerSubtitle}>
          Gerencie sua clínica de forma simples e rápida.
        </Text>
      </View>

      {/* --- Corpo Branco Arredondado --- */}
      <View style={styles.bodyContainer}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <BotaoMenu
            icone={IconeMedic}
            titulo="Médicos"
            subtitulo="Gerenciar corpo clínico"
            color="#4CAF50" // Verde
            onPress={() => navigation.navigate("Medicos")}
          />

          <BotaoMenu
            icone={IconePaciente}
            titulo="Pacientes"
            subtitulo="Cadastro e histórico"
            color="#007AFF" // Azul
            onPress={() => navigation.navigate("Pacientes")}
          />

          <BotaoMenu
            icone={IconeConsulta}
            titulo="Consultas"
            subtitulo="Agendamentos do dia"
            color="#FF9800" // Laranja
            onPress={() => navigation.navigate("Consultas")}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#007AFF", // Fundo azul para a parte superior (status bar)
  },
  headerContainer: {
    padding: 25,
    paddingTop: 40,
    backgroundColor: "#007AFF",
    height: "30%", // Ocupa 30% da tela
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logoHeader: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    resizeMode: "contain",
  },
  welcomeText: {
    color: "#E0E0E0",
    fontSize: 18,
  },
  brandText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#B3E5FC",
    fontSize: 14,
    marginTop: 5,
  },

  // O corpo branco que sobe sobre o azul
  bodyContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA", // Um cinza bem clarinho, quase branco
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
    marginTop: -20, // Sobe um pouco para cobrir o azul
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginLeft: 10,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
});

export default MenuScreen;
