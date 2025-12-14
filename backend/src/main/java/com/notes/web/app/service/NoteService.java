package com.notes.web.app.service;

import com.notes.web.app.entity.Note;
import com.notes.web.app.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    private final AIService aiService;
    // Constructor Injection (Better than @Autowired)
    public NoteService(NoteRepository noteRepository, AIService aiService) {
        this.noteRepository = noteRepository;
        this.aiService = aiService;
    }

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Note createNote(Note note) {
        Note saved = noteRepository.save(note);
        aiService.generateAndStoreEmbedding(saved);
        return noteRepository.save(note);
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public Note updateNote(Long id, Note noteDetails) {
        return noteRepository.findById(id).map(note -> {
            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            return noteRepository.save(note);
        }).orElseThrow(() -> new RuntimeException("Note not found with id " + id));
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    public List<Note> getNotesForUser(String username) {
        return noteRepository.findByUserUsername(username);
    }

    public List<Note> searchNotes(String query, String username) {
        List<Note> userNotes = noteRepository.findByUserUsername(username);
        return aiService.searchNotes(query, userNotes);
    }
}