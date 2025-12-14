package com.notes.web.app.controller;

import com.notes.web.app.entity.Note;
import com.notes.web.app.entity.User;
import com.notes.web.app.repository.UserRepository;
import com.notes.web.app.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;
    private final UserRepository userRepository; // <--- Add this

    // Add UserRepository to the constructor
    public NoteController(NoteService noteService, UserRepository userRepository) {
        this.noteService = noteService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Note> getAllNotes() {
        // 1. Get the username of the person currently logged in
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Return ONLY their notes
        return noteService.getNotesForUser(username);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNote(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        // 1. Get the username from the Security Context (Session)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Find the full User entity from the database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Set the user on the note BEFORE saving
        note.setUser(user);

        return noteService.createNote(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        try {
            return ResponseEntity.ok(noteService.updateNote(id, noteDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<Note> searchNotes(@RequestParam String query) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return noteService.searchNotes(query, username);
    }
}