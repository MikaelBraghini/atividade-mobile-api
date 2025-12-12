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
const CalendarIcon = require("../../../assets/calendario.png");
const SearchIcon = require("../../../assets/lupa.png");

// Configuração da API
const API_URL = "http://10.110.12.63:8080/consultas";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Lógica de Filtro e Agrupamento (Por Data)
const groupAndFilterConsultas = (consultas, searchText) => {
  if (!Array.isArray(consultas)) return [];
  const textoBusca = searchText ? searchText.toLowerCase() : "";

  const filtered = consultas.filter((c) => {
    const medico = c.nomeMedico ? c.nomeMedico.toLowerCase() : "";
    const paciente = c.nomePaciente ? c.nomePaciente.toLowerCase() : "";
    return medico.includes(textoBusca) || paciente.includes(textoBusca);
  });

  // Agrupa por Dia (AAAA-MM-DD)
  const grouped = filtered.reduce((acc, item) => {
    const data = item.dataHora ? item.dataHora.split("T")[0] : "Sem Data";
    if (!acc[data]) acc[data] = [];
    acc[data].push(item);
    return acc;
  }, {});

  // Ordena cronologicamente (datas mais recentes primeiro ou futuras)
  // Aqui ordenamos strings, "2025..." vem depois de "2024..."
  return Object.keys(grouped)
    .sort()
    .reverse()
    .map((key) => ({ title: key, data: grouped[key] }));
};

// --- NOVO COMPONENTE DE CARD DE CONSULTA ---
const ConsultaCard = ({ consulta, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleCancelConfirm = () => {
    const performCancel = () => onCancel(consulta.id);

    if (Platform.OS === "web") {
      if (window.confirm("Cancelar esta consulta?")) performCancel();
    } else {
      Alert.alert(
        "Cancelar Consulta",
        "Tem certeza? Essa ação não pode ser desfeita.",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim, Cancelar",
            style: "destructive",
            onPress: performCancel,
          },
        ]
      );
    }
  };

  // Formatação visual da hora e data
  const hora = consulta.dataHora
    ? consulta.dataHora.split("T")[1].substring(0, 5)
    : "--:--";
  const isCancelada = consulta.situacao === "CANCELADA";

  return (
    <View
      style={[
        styles.cardContainer,
        isCancelada && styles.cardContainerCancelada,
      ]}
    >
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        {/* Ícone de Calendário / Relógio */}
        <View
          style={[
            styles.iconContainer,
            isCancelada ? styles.iconContainerCancelada : null,
          ]}
        >
          <Text style={styles.hourText}>{hora}</Text>
        </View>

        {/* Informações Principais */}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, isCancelada && styles.textCancelado]}>
            {consulta.nomeMedico || "Médico Aleatório"}
          </Text>
          <Text style={styles.cardSub}>Paciente: {consulta.nomePaciente}</Text>
          {isCancelada && <Text style={styles.statusBadge}>CANCELADA</Text>}
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
            <Text style={styles.detailLabel}>ID:</Text>
            <Text style={styles.detailValue}>#{consulta.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data:</Text>
            <Text style={styles.detailValue}>
              {consulta.dataHora ? consulta.dataHora.replace("T", " às ") : "-"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Situação:</Text>
            <Text
              style={[
                styles.detailValue,
                { fontWeight: "bold", color: isCancelada ? "red" : "green" },
              ]}
            >
              {consulta.situacao}
            </Text>
          </View>

          {/* Ações (Só mostra Cancelar se estiver Agendada) */}
          {!isCancelada && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnDelete]}
                onPress={handleCancelConfirm}
              >
                <Text style={styles.btnText}>Cancelar Agendamento</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// --- TELA PRINCIPAL DE CONSULTAS ---
const Consulta = ({ navigation }) => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchConsultas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?size=100&sort=dataHora,desc`);
      if (!response.ok) throw new Error("Erro HTTP");
      const data = await response.json();

      if (data.content) {
        setConsultas(data.content);
      } else {
        setConsultas([]);
      }
    } catch (error) {
      console.error(error);
      if (Platform.OS !== "web")
        Alert.alert("Erro", "Falha ao carregar consultas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConsultas();
    }, [fetchConsultas])
  );

  const handleCancel = async (id) => {
    try {
      const payload = {
        consultaId: id,
        motivoCancelamento: "Solicitado pelo App",
      };
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (Platform.OS === "web") window.alert("Cancelada com sucesso.");
        else Alert.alert("Sucesso", "Consulta cancelada.");
        fetchConsultas();
      } else {
        throw new Error(await response.text());
      }
    } catch (e) {
      if (Platform.OS === "web") window.alert("Erro ao cancelar.");
      else Alert.alert("Erro", "Não foi possível cancelar.");
    }
  };

  const sections = useMemo(
    () => groupAndFilterConsultas(consultas, searchText),
    [consultas, searchText]
  );

  return (
    <View style={styles.screenContainer}>
      {/* StatusBar Laranja */}
      <StatusBar barStyle="light-content" backgroundColor="#FF9800" />

      {/* CABEÇALHO LARANJA */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Minhas Consultas</Text>
        <Text style={styles.headerSubtitle}>Acompanhe a agenda da clínica</Text>

        {/* BARRA DE BUSCA */}
        <View style={styles.searchContainer}>
          <Image source={SearchIcon} style={styles.searchIcon} />
          <TextInput
            placeholder="Filtrar por médico ou paciente..."
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
            <ConsultaCard consulta={item} onCancel={handleCancel} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            // Formata a data do título da seção (Ex: 2025-12-25 -> 25/12/2025)
            <View style={styles.sectionHeaderContainer}>
              <Image source={CalendarIcon} style={styles.sectionIcon} />
              <Text style={styles.sectionHeader}>
                {title.split("-").reverse().join("/")}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? "Carregando..." : "Nenhuma consulta agendada."}
            </Text>
          }
        />
      </View>

      {/* FAB LARANJA */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AgendamentoConsulta")}
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
    backgroundColor: "#FF9800", // Fundo LARANJA no topo
  },
  headerContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#FF9800",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFF3E0",
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

  // CORPO BRANCO
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

  // CABEÇALHO DA SEÇÃO (DATA)
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 16,
    height: 16,
    tintColor: "#FF9800",
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
    fontSize: 16,
  },

  // CARD DE CONSULTA
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
  cardContainerCancelada: {
    opacity: 0.6,
    backgroundColor: "#FAFAFA",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  // Box da Hora (Laranja)
  iconContainer: {
    width: 60,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFF3E0", // Laranja bem claro
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  iconContainerCancelada: {
    backgroundColor: "#EEE",
    borderColor: "#DDD",
  },
  hourText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100", // Laranja escuro
  },

  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  textCancelado: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  cardSub: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 10,
    color: "red",
    fontWeight: "bold",
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
  },
  btnAction: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnDelete: {
    backgroundColor: "#FF3B30",
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  // FAB LARANJA
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF9800",
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

export default Consulta;
