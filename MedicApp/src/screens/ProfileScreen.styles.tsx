import { StyleSheet } from 'react-native';

const stylesProfile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbfc',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  prefLabel: {
    fontSize: 15,
  },
  langButtons: {
    flexDirection: 'row',
  },
  langButton: {
    padding: 8,
    backgroundColor: '#e5f3ff',
    borderRadius: 6,
    marginHorizontal: 5,
  },
  langActive: {
    backgroundColor: '#0077b6',
  },
  langText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#d90429',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#0077b6",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0077b6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});


export default stylesProfile;
