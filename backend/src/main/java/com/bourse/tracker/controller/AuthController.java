package com.bourse.tracker.controller;

import com.bourse.tracker.dto.request.LoginRequest;
import com.bourse.tracker.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        UserDetails user = userDetailsService.loadUserByUsername(req.username());
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        String token = jwtUtil.generateToken(req.username());
        return ResponseEntity.ok(Map.of("token", token, "username", req.username()));
    }
}
