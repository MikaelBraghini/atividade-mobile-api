import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// Importando Assets
const AvatarIcon = require("../../../assets/utilizador.png");
const SearchIcon = require("../../../assets/lupa.png");

// Configuração da API
const API_URL = "http://10.110.12.63:8080/pacientes";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Lógica de Filtro e Agrupamento (Mantida)
const groupAndFilterPacientes = (pacientes, searchText) => {
  if (!Array.isArray(pacientes)) return [];
  const textoBusca = searchText ? searchText.toLowerCase() : "";

  const filtered = pacientes.filter((paciente) => {
    const nome = paciente.nome ? paciente.nome.toLowerCase() : "";
    const cpf = paciente.cpf ? paciente.cpf.toLowerCase() : "";
    return nome.includes(textoBusca) || cpf.includes(textoBusca);
  });

  const grouped = filtered.reduce((acc, paciente) => {
    const firstLetter =
      paciente.nome && paciente.nome[0] ? paciente.nome[0].toUpperCase() : "#";
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(paciente);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort()
    .map((key) => ({ title: key, data: grouped[key] }));
};

// --- NOVO COMPONENTE DE CARD ---
const PacienteCard = ({ paciente, navigation, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleDeleteConfirm = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Inativar ${paciente.nome}?`);
      if (confirmed) onDelete(paciente.id);
    } else {
      Alert.alert(
        "Inativar Paciente",
        `Tem certeza que deseja inativar ${paciente.nome}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, Inativar",
            style: "destructive",
            onPress: () => onDelete(paciente.id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={AvatarIcon}
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>

        {/* Informações Principais */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {paciente.nome || "Sem Nome"}
          </Text>
          <Text style={styles.cardSub}>
            {paciente.cpf ? `CPF: ${paciente.cpf}` : "CPF não informado"}
          </Text>
        </View>

        {/* Seta */}
        <Text
          style={[
            styles.arrow,
            { transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] },
          ]}
        >
          {">"}
        </Text>
      </TouchableOpacity>

      {/* Detalhes Expansíveis */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{paciente.email}</Text>
          </View>
          {paciente.telefone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telefone:</Text>
              <Text style={styles.detailValue}>{paciente.telefone}</Text>
            </View>
          )}

          {/* Ações */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnEdit]}
              onPress={() =>
                navigation.navigate("CadastroEdicaoPaciente", { paciente })
              }
            >
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAction, styles.btnDelete]}
              onPress={handleDeleteConfirm}
            >
              <Text style={styles.btnText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// --- TELA PRINCIPAL ---
const Paciente = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=100&sort=nome,asc`);
      const data = await response.json();
      if (data.content) {
        setPacientes(data.content);
      } else {
        setPacientes([]);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPacientes();
    }, [fetchPacientes])
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        if (Platform.OS === "web") window.alert("Sucesso!");
        else Alert.alert("Sucesso", "Paciente inativado.");
        fetchPacientes();
      } else {
        throw new Error("Erro ao excluir");
      }
    } catch (e) {
      if (Platform.OS !== "web") Alert.alert("Erro", "Falha na comunicação.");
    }
  };

  const sections = useMemo(
    () => groupAndFilterPacientes(pacientes, searchText),
    [pacientes, searchText]
  );

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      {/* CABEÇALHO AZUL */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Pacientes</Text>
        <Text style={styles.headerSubtitle}>
          Gerencie os cadastros da clínica
        </Text>

        {/* BARRA DE BUSCA FLUTUANTE */}
        <View style={styles.searchContainer}>
          <Image source={SearchIcon} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por nome ou CPF..."
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* CORPO DA LISTA */}
      <View style={styles.bodyContainer}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PacienteCard
              paciente={item}
              navigation={navigation}
              onDelete={handleDelete}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? "Carregando..." : "Nenhum paciente encontrado."}
            </Text>
          }
        />
      </View>

      {/* FAB (Floating Action Button) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("CadastroEdicaoPaciente")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ESTRUTURA GERAL
  screenContainer: {
    flex: 1,
    backgroundColor: "#007AFF", // Fundo azul no topo
  },
  headerContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40, // Espaço extra para a barra de busca "entrar"
    backgroundColor: "#007AFF",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E3F2FD",
    marginBottom: 15,
  },

  // BARRA DE BUSCA
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    // Sombra
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#999",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  // CORPO BRANCO ARREDONDADO
  bodyContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25, // Sobe por cima do azul
    paddingTop: 15,
    overflow: "hidden", // Garante que o conteúdo respeite as bordas arredondadas
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espaço para o FAB
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
    fontSize: 16,
  },

  // ESTILOS DO CARD
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD", // Azul bem clarinho
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatar: {
    width: 28,
    height: 28,
    tintColor: "#007AFF",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardSub: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: "#CCC",
    fontWeight: "bold",
  },

  // DETALHES EXPANDIDOS
  cardBody: {
    padding: 15,
    paddingTop: 0,
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  detailRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
    width: 70,
  },
  detailValue: {
    color: "#333",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "flex-end",
    gap: 10,
  },
  btnAction: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnEdit: {
    backgroundColor: "#007AFF",
  },
  btnDelete: {
    backgroundColor: "#FF3B30", // Vermelho iOS
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // FAB (BOTÃO FLUTUANTE)
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    marginTop: -4, // Ajuste visual leve
  },
});

export default Paciente;
