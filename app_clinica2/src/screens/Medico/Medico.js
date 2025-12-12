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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// Importando Assets
const DoctorIcon = require("../../../assets/usuario-md.png");
const SearchIcon = require("../../../assets/lupa.png");

// Configuração da API
const API_URL = "http://10.110.12.63:8080/medicos";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Lógica de Filtro e Agrupamento
const groupAndFilterMedicos = (medicos, searchText) => {
  if (!Array.isArray(medicos)) return [];
  const textoBusca = searchText ? searchText.toLowerCase() : "";

  const filtered = medicos.filter((medico) => {
    const nome = medico.nome ? medico.nome.toLowerCase() : "";
    const especialidade = medico.especialidade
      ? medico.especialidade.toLowerCase()
      : "";
    return nome.includes(textoBusca) || especialidade.includes(textoBusca);
  });

  const grouped = filtered.reduce((acc, medico) => {
    const firstLetter =
      medico.nome && medico.nome[0] ? medico.nome[0].toUpperCase() : "#";
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(medico);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort()
    .map((key) => ({ title: key, data: grouped[key] }));
};

// --- NOVO COMPONENTE DE CARD DE MÉDICO ---
const MedicoCard = ({ medico, navigation, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleDeleteConfirm = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Inativar Dr(a). ${medico.nome}?`);
      if (confirmed) onDelete(medico.id);
    } else {
      Alert.alert(
        "Inativar Médico",
        `Tem certeza que deseja inativar ${medico.nome}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, Inativar",
            style: "destructive",
            onPress: () => onDelete(medico.id),
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
        {/* Avatar com cor diferenciada (Verde para médicos) */}
        <View style={styles.avatarContainer}>
          <Image
            source={DoctorIcon}
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>

        {/* Informações Principais */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {medico.nome || "Sem Nome"}
          </Text>
          <Text style={styles.cardSub}>
            {medico.especialidade || "Clínico Geral"}
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
            <Text style={styles.detailLabel}>CRM:</Text>
            <Text style={styles.detailValue}>{medico.crm}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{medico.email}</Text>
          </View>
          {medico.telefone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telefone:</Text>
              <Text style={styles.detailValue}>{medico.telefone}</Text>
            </View>
          )}

          {/* Ações */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnEdit]}
              onPress={() =>
                navigation.navigate("CadastroEdicaoMedico", { medico })
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

// --- TELA PRINCIPAL DE MÉDICOS ---
const Medico = ({ navigation }) => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchMedicos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=100&sort=nome,asc`);
      if (!response.ok) throw new Error("Erro na resposta da API");
      const data = await response.json();

      if (data.content) {
        setMedicos(data.content);
      } else {
        setMedicos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMedicos();
    }, [fetchMedicos])
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        if (Platform.OS === "web") window.alert("Sucesso!");
        else Alert.alert("Sucesso", "Médico inativado.");
        fetchMedicos();
      } else {
        throw new Error("Falha ao excluir");
      }
    } catch (e) {
      if (Platform.OS !== "web")
        Alert.alert("Erro", "Não foi possível inativar o médico.");
    }
  };

  const sections = useMemo(
    () => groupAndFilterMedicos(medicos, searchText),
    [medicos, searchText]
  );

  return (
    <View style={styles.screenContainer}>
      {/* StatusBar verde para diferenciar da tela de pacientes (azul) */}
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* CABEÇALHO VERDE */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Médicos</Text>
        <Text style={styles.headerSubtitle}>Gerencie o corpo clínico</Text>

        {/* BARRA DE BUSCA */}
        <View style={styles.searchContainer}>
          <Image source={SearchIcon} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por nome ou especialidade..."
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
            <MedicoCard
              medico={item}
              navigation={navigation}
              onDelete={handleDelete}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? "Carregando..." : "Nenhum médico encontrado."}
            </Text>
          }
          refreshControl={
            // Adicione o RefreshControl se quiser "puxar para atualizar" nativo
            null
          }
        />
      </View>

      {/* FAB (Floating Action Button) VERDE */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("CadastroEdicaoMedico")}
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
    backgroundColor: "#4CAF50", // Fundo VERDE no topo
  },
  headerContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#4CAF50",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E8F5E9",
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
    marginTop: -25,
    paddingTop: 15,
    overflow: "hidden",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50", // Título da seção em verde
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
    backgroundColor: "#E8F5E9", // Verde bem clarinho
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatar: {
    width: 28,
    height: 28,
    tintColor: "#4CAF50", // Ícone verde
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

  // DETALHES
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
    backgroundColor: "#4CAF50", // Botão editar verde
  },
  btnDelete: {
    backgroundColor: "#FF3B30",
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // FAB VERDE
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
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
    marginTop: -4,
  },
});

export default Medico;
