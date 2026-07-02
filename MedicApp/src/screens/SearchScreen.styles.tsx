import { StyleSheet, Platform } from "react-native";

const stylesearch = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "#1f2937",
    marginBottom: 5,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filtersScroll: {
    paddingRight: 20,
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  filterText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: "#6366f1",
    marginBottom: 6,
    fontWeight: '500',
  },
  adresse: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#6366f1",
    borderRadius: 8,
  },
  moreButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles legacy pour compatibilité
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
  loader: {
    marginTop: 24,
  },
});

export default stylesearch;
