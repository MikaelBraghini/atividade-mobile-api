// src/components/BotaoMenu.js
import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const BotaoMenu = ({
  icone,
  titulo,
  subtitulo,
  onPress,
  color = "#007AFF",
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Lado Esquerdo: Ícone com fundo colorido */}
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        {icone && (
          <Image source={icone} style={styles.icon} resizeMode="contain" />
        )}
      </View>

      {/* Centro: Textos */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{titulo}</Text>
        {subtitulo && <Text style={styles.subtitle}>{subtitulo}</Text>}
      </View>

      {/* Lado Direito: Seta indicativa */}
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrow, { color: color }]}>{">"}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.9, // 90% da largura da tela
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    // Sombra suave (Elevation para Android, Shadow para iOS)
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#fff", // Deixa o ícone branco para contrastar com o fundo colorido
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
  arrow: {
    fontSize: 24,
    fontWeight: "bold",
    opacity: 0.6,
  },
});

export default BotaoMenu;
