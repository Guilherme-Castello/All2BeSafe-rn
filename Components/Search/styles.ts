
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    /*
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 48,    
    width: '92%',     
    alignSelf: 'center', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C3C5CB',    
    marginTop: 5,
    justifyContent: 'center',   */
    flexDirection: 'row', // Coloca ícone e input na mesma linha
    alignItems: 'center', // Centraliza verticalmente
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12, // Ajustado para dar respiro ao ícone
    height: 48,
    width: '92%',
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C3C5CB',
    marginTop: 5,   
  },  
  input: {
    flex: 1, // Faz o campo de texto ocupar todo o resto do espaço
    height: '100%',
    marginLeft: 8, // Espaço entre o ícone e o texto
    fontSize: 16,
    color: '#333',
  }
})