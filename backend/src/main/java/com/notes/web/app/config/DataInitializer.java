package com.notes.web.app.config;

import com.notes.web.app.entity.Note;
import com.notes.web.app.repository.NoteRepository;
import com.notes.web.app.service.AIService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final NoteRepository noteRepository;
    private final AIService aiService;

    public DataInitializer(NoteRepository noteRepository, AIService aiService) {
        this.noteRepository = noteRepository;
        this.aiService = aiService;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- 🧠 AI Initialization Started ---");

        List<Note> allNotes = noteRepository.findAll();
        System.out.println("Found " + allNotes.size() + " notes in database. Generating embeddings...");

        for (Note note : allNotes) {
            // Generate embedding for each note
            aiService.generateAndStoreEmbedding(note);

            // Wait a bit to avoid hitting API rate limits (Hugging Face Free Tier)
            Thread.sleep(500);
        }

        System.out.println("--- ✅ AI Initialization Complete. Brain is ready! ---");
    }
}