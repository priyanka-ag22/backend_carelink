package com.hospital.carelink.controller;

import com.hospital.carelink.repository.AnalyticsJdbcDao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST Controller for serving Dashboard Analytics.
 * Author: Kshitij Rajput
 */
@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsJdbcDao analyticsJdbcDao;

    public AnalyticsController(AnalyticsJdbcDao analyticsJdbcDao) {
        this.analyticsJdbcDao = analyticsJdbcDao;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        // Direct call to JDBC DAO for optimized read-only operations
        Map<String, Object> stats = analyticsJdbcDao.getHospitalDashboardStats();
        return ResponseEntity.ok(stats);
    }
}