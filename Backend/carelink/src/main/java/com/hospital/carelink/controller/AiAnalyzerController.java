package com.hospital.carelink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiAnalyzerController {

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeSymptoms(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = Map.of(
                "severity", "Moderate",
                "urgency", "See Doctor Soon",
                "top_diagnoses", List.of("Acute Bronchitis", "Viral Respiratory Infection", "Mild Asthma Exacerbation"),
                "recommended_tests", List.of("Chest X-Ray", "Complete Blood Count", "Spirometry"),
                "immediate_actions", "Rest, stay hydrated, and monitor temperature. If breathing worsens, seek emergency care.",
                "specialist_referral", "Consult a Pulmonologist if symptoms persist beyond 2 weeks.",
                "red_flags", List.of("SpO2 dropping below 92%", "Inability to speak in full sentences"),
                "disclaimer", "This is a mock AI response for demonstration purposes. Not real medical advice."
        );
        return ResponseEntity.ok(response);
    }
}
