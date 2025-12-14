package com.notes.web.app.service;

import com.notes.web.app.entity.Note;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    // Revert to proven endpoint from curl
    private static final String HF_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    private final WebClient webClient;

    // In-Memory Vector Storage (Simulating a Vector DB for this assignment)
    // Map<NoteID, EmbeddingVector>
    private final Map<Long, List<Double>> vectorIndex = new HashMap<>();

    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(HF_API_URL).build();
        // Enhanced debug (as above)
        if (hfApiKey == null || hfApiKey.trim().isEmpty()) {
            System.err.println("❌ HF Key: MISSING/NULL - Check application.properties!");
        } else if (!hfApiKey.startsWith("hf_")) {
            System.err.println("❌ HF Key: INVALID FORMAT (doesn't start with 'hf_')");
        } else {
            String prefix = hfApiKey.substring(0, Math.min(8, hfApiKey.length())) + "...";
            System.out.println("✅ HF Key: LOADED (" + prefix + ")");
        }
    }

    // 1. Generate Embedding for a Note (Async)
    public void generateAndStoreEmbedding(Note note) {
        String text = note.getTitle() + " " + note.getContent();
        fetchEmbedding(text).subscribe(embedding -> {
            if (!embedding.isEmpty() && embedding.size() == 384) {  // Validate full embedding
                vectorIndex.put(note.getId(), embedding);
                System.out.println("✅ Generated embedding for note: " + note.getId() + " (384 dims)");
            } else {
                System.err.println("❌ Skipped invalid/empty embedding for note: " + note.getId() + " (size: " + (embedding != null ? embedding.size() : "null") + ")");
            }
        });
    }

    // 2. Remove embedding if note is deleted
    public void removeEmbedding(Long noteId) {
        vectorIndex.remove(noteId);
    }

    // 3. Search Method
    // 3. Search Method (Hybrid: Semantic + Keyword, with Threshold & Limit)
    public List<Note> searchNotes(String query, List<Note> allNotes) {
        // Keyword matching (always compute for hybrid boost)
        List<Note> keywordMatches = allNotes.stream()
                .filter(n -> n.getTitle().toLowerCase().contains(query.toLowerCase())
                        || n.getContent().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());

        // Semantic: Get query embedding
        List<Double> queryVector = fetchEmbedding(query).block();
        if (queryVector == null || queryVector.isEmpty()) {
            System.err.println("⚠️ Semantic failed; using keywords only");
            return keywordMatches;  // Fallback
        }

        if (vectorIndex.isEmpty()) {
            System.err.println("⚠️ No stored embeddings; using keywords only");
            return keywordMatches;
        }

        // Calculate Semantic Scores
        Map<Note, Double> scores = new HashMap<>();
        for (Note note : allNotes) {
            List<Double> noteVector = vectorIndex.get(note.getId());
            if (noteVector != null && !noteVector.isEmpty()) {
                double similarity = cosineSimilarity(queryVector, noteVector);
                scores.put(note, similarity);
            }
        }

        // FIXED: Filter threshold (>0.2 for "relevant") + sort descending + top 5 limit
        // Boost keywords: Add 0.1 bonus if keyword match
        List<Note> semanticResults = scores.entrySet().stream()
                .filter(entry -> entry.getValue() > 0.2)  // Threshold: Tune this (test with known queries)
                .map(entry -> {
                    Note note = entry.getKey();
                    double score = entry.getValue();
                    if (keywordMatches.contains(note)) {
                        score += 0.1;  // Hybrid boost for exact keywords
                    }
                    return new AbstractMap.SimpleEntry<>(note, score);
                })
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))  // Descending
                .limit(5)  // Top-K: Prevents dumping all notes
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Hybrid: Prioritize semantic, but include any keyword-only misses
        Set<Note> resultSet = new HashSet<>(semanticResults);
        resultSet.addAll(keywordMatches);
        return resultSet.stream()
                .sorted((n1, n2) -> {
                    // Sort by semantic score if available, else arbitrary
                    Double s1 = scores.get(n1);
                    Double s2 = scores.get(n2);
                    if (s1 != null && s2 != null) return Double.compare(s2, s1);
                    return 0;
                })
                .collect(Collectors.toList());
    }

    // --- Helper: Call Hugging Face API ---
    private reactor.core.publisher.Mono<List<Double>> fetchEmbedding(String text) {
        if (hfApiKey == null || hfApiKey.trim().isEmpty()) {
            System.err.println("❌ HF API key missing - skipping embedding");
            return reactor.core.publisher.Mono.just(new ArrayList<>());
        }

        // Proven body from curl: {"inputs": ["text"]}
        Map<String, List<String>> requestBody = new HashMap<>();
        requestBody.put("inputs", Collections.singletonList(text));

        return webClient.post()
                .header("Authorization", "Bearer " + hfApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Object.class)
                .map(response -> {
                    if (response instanceof List) {
                        List<?> list = (List<?>) response;
                        if (list.isEmpty()) return new ArrayList<Double>();

                        Object firstItem = list.get(0);
                        if (firstItem instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<Double> embedding = (List<Double>) firstItem;
                            return embedding;
                        }
                        @SuppressWarnings("unchecked")
                        List<Double> embedding = (List<Double>) list;
                        return embedding;
                    }
                    System.err.println("Unexpected response type: " + (response != null ? response.getClass() : "null"));
                    return new ArrayList<Double>();
                })
                .onErrorResume(e -> {
                    System.err.println("AI API Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
                    if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                        org.springframework.web.reactive.function.client.WebClientResponseException wcre = (org.springframework.web.reactive.function.client.WebClientResponseException) e;
                        System.err.println("Status: " + wcre.getStatusCode() + ", Body: " + wcre.getResponseBodyAsString());
                    }
                    return reactor.core.publisher.Mono.just(new ArrayList<>());
                });
    }

    // --- Helper: Math (Cosine Similarity) ---
    private double cosineSimilarity(List<Double> vectorA, List<Double> vectorB) {
        if (vectorA.size() != vectorB.size()) {
            System.err.println("Vector dim mismatch: " + vectorA.size() + " vs " + vectorB.size());
            return 0.0;
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.size(); i++) {
            dotProduct += vectorA.get(i) * vectorB.get(i);
            normA += Math.pow(vectorA.get(i), 2);
            normB += Math.pow(vectorB.get(i), 2);
        }
        double denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator == 0 ? 0.0 : dotProduct / denominator;
    }
}