package com.hospital.carelink.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "CareLink Hospital Management System Backend is Live & Running Smoothly!";
    }
}