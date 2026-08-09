package com.hospital.carelink.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

/**
 * Native JDBC DAO for complex analytics and dashboard queries.
 * Using JdbcTemplate here instead of JPA for better performance on aggregation queries.
 * Author: Kshitij Rajput
 */
@Repository
public class AnalyticsJdbcDao {

    private final JdbcTemplate jdbcTemplate;

    // Constructor Injection for JdbcTemplate (Auto-configured by Spring Boot)
    public AnalyticsJdbcDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getHospitalDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Query 1: Total number of claims in the system
        String totalClaimsSql = "SELECT COUNT(*) FROM claim";
        Integer totalClaims = jdbcTemplate.queryForObject(totalClaimsSql, Integer.class);

        // Query 2: Total amount of APPROVED claims
        // Using COALESCE to handle nulls if database is empty
        String approvedAmountSql = "SELECT COALESCE(SUM(requested_amount), 0) FROM claim WHERE status = 'APPROVED'";
        Double approvedAmount = jdbcTemplate.queryForObject(approvedAmountSql, Double.class);

        stats.put("totalClaims", totalClaims);
        stats.put("totalApprovedAmountINR", approvedAmount);

        return stats;
    }
}