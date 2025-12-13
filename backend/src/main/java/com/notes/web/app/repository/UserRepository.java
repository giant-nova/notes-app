package com.notes.web.app.repository;

import com.notes.web.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring generates the SQL for this automatically!
    Optional<User> findByUsername(String username);
}