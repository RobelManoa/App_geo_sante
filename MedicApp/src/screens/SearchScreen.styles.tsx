import { StyleSheet } from "react-native";

const stylesearch = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold" as const,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  moreButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#0077b6",
    borderRadius: 6,
  },
  moreButtonText: {
    color: "#fff",
    fontWeight: "bold" as const,
  },
  loader: {
    marginTop: 24,
  },
  adresse: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  retryText: {
    color: "#0077b6",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#666",
  },
 filterButton: {
  backgroundColor: '#f5f5f5',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 25, 
  marginRight: 8,
  borderWidth: 0.5,
  borderColor: '#ddd',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
  filterButtonSelected: {
    backgroundColor: "#0077b6",
  },
  filterText: {
    color: "#333",
  },
  filterTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default stylesearch;
