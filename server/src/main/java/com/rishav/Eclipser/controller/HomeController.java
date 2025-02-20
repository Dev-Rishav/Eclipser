package com.rishav.Eclipser.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class HomeController {

    @GetMapping("/")
    @ResponseBody
    public String greet() {
        return "Hello";
    }
    
}
