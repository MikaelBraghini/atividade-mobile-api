// src/components/PacienteForm.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert 
} from 'react-native';

const initialPacienteState = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  logradouro: '',
  bairro: '', // Campo obrigatório na API
  numero: '',
  complemento: '',
  cidade: '',
  uf: '',
  cep: '',
};

const ValidatedInput = ({ label, name, formData, errors, handleChange, editable = true, ...props }) => (
  <View style={formStyles.inputGroup}>
    <Text style={formStyles.label}>{label}</Text>
    <TextInput
      style={[
        formStyles.input, 
        errors[name] && formStyles.inputError,
        !editable && formStyles.inputDisabled
      ]}
      value={formData[name]}
      onChangeText={(text) => handleChange(name, text)}
      editable={editable}
      {...props}
    />
    {errors[name] && <Text style={formStyles.errorText}>{errors[name]}</Text>}
  </View>
);

const PacienteForm = ({ paciente, onSave, onCancel, navigation }) => {
  const [formData, setFormData] = useState(paciente || initialPacienteState);
  const [errors, setErrors] = useState({});

  const isEditing = !!paciente && !!paciente.id;
  const buttonTitle = isEditing ? 'Concluir Edição' : 'Concluir Cadastro';

  // "bairro" foi adicionado aos campos obrigatórios
  const requiredFields = ['nome', 'cpf', 'email', 'telefone', 'logradouro', 'bairro', 'cidade', 'uf', 'cep'];

  useEffect(() => {
    if (paciente) {
      // Se vier da API, o endereço pode vir aninhado ou plano dependendo de onde chamamos
      // Aqui garantimos que o formulário receba plano
      const endereco = paciente.endereco || {};
      setFormData({
        ...initialPacienteState,
        ...paciente,
        // Espalha endereço se ele existir como objeto
        logradouro: endereco.logradouro || paciente.logradouro || '',
        bairro: endereco.bairro || paciente.bairro || '',
        cep: endereco.cep || paciente.cep || '',
        cidade: endereco.cidade || paciente.cidade || '',
        uf: endereco.uf || paciente.uf || '',
        numero: endereco.numero || paciente.numero || '',
        complemento: endereco.complemento || paciente.complemento || '',
      });
    }
  }, [paciente]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'Campo Obrigatório';
        valid = false;
      }
    });
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    } else {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</Text>

        <Text style={styles.sectionHeader}>1. Dados Pessoais</Text>
        <ValidatedInput 
          label="Nome Completo" 
          name="nome" 
          placeholder="Nome do paciente"
          formData={formData} errors={errors} handleChange={handleChange}
        />
        <ValidatedInput 
          label="CPF" 
          name="cpf" 
          placeholder="000.000.000-00" 
          keyboardType="numeric"
          editable={!isEditing} // Não pode editar CPF na API
          formData={formData} errors={errors} handleChange={handleChange}
        />
        
        <Text style={styles.sectionHeader}>2. Contato</Text>
        <ValidatedInput 
          label="Email" 
          name="email" 
          placeholder="email@exemplo.com" 
          keyboardType="email-address"
          editable={!isEditing} // Não pode editar Email na API
          formData={formData} errors={errors} handleChange={handleChange}
        />
        <ValidatedInput 
          label="Telefone" 
          name="telefone" 
          placeholder="(XX) XXXXX-XXXX" 
          keyboardType="phone-pad"
          formData={formData} errors={errors} handleChange={handleChange}
        />

        <Text style={styles.sectionHeader}>3. Endereço</Text>
        <ValidatedInput 
          label="CEP" 
          name="cep" 
          keyboardType="numeric"
          maxLength={9}
          formData={formData} errors={errors} handleChange={handleChange}
        />
        <ValidatedInput 
          label="Logradouro" 
          name="logradouro" 
          placeholder="Rua, Avenida..."
          formData={formData} errors={errors} handleChange={handleChange}
        />
        <ValidatedInput 
          label="Bairro" 
          name="bairro" 
          placeholder="Bairro"
          formData={formData} errors={errors} handleChange={handleChange}
        />
        <View style={formStyles.row}>
            <ValidatedInput 
              label="Número" 
              name="numero" 
              style={formStyles.inputHalf} 
              keyboardType="numeric"
              formData={formData} errors={errors} handleChange={handleChange}
            />
            <ValidatedInput 
              label="Complemento" 
              name="complemento" 
              style={formStyles.inputHalf} 
              formData={formData} errors={errors} handleChange={handleChange}
            />
        </View>
        <View style={formStyles.row}>
            <ValidatedInput 
              label="Cidade" 
              name="cidade" 
              style={formStyles.inputThreeQuarter}
              formData={formData} errors={errors} handleChange={handleChange}
            />
            <ValidatedInput 
              label="UF" 
              name="uf" 
              style={formStyles.inputQuarter} 
              maxLength={2}
              autoCapitalize="characters"
              formData={formData} errors={errors} handleChange={handleChange}
            />
        </View>

      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[formStyles.button, formStyles.saveButton]} onPress={handleSubmit}>
          <Text style={formStyles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[formStyles.button, formStyles.cancelButton]} 
          onPress={onCancel || (() => navigation.goBack())}
        >
          <Text style={formStyles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#007AFF', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' },
});

const formStyles = StyleSheet.create({
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, fontWeight: '500', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#f9f9f9', height: 45 },
  inputError: { borderColor: 'red', borderWidth: 2, backgroundColor: '#ffe8e8' },
  inputDisabled: { backgroundColor: '#e0e0e0', color: '#888' },
  errorText: { fontSize: 12, color: 'red', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  inputHalf: { flex: 1 },
  inputQuarter: { flex: 0.3 },
  inputThreeQuarter: { flex: 0.7 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: '#007AFF' },
  cancelButton: { backgroundColor: '#6c757d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PacienteForm;