package com.rishav.Eclipser.controller;


import com.rishav.Eclipser.model.Users;
import com.rishav.Eclipser.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
public class UserController {
    @Autowired
    private UserService userService;


    @PostMapping("/login")
    @ResponseBody
    public String login(@RequestBody Users user) {
        return userService.verify(user);
    }

    @GetMapping("/login")
    @ResponseBody
    public String greet(){
        return  "Hello";
    }

    @PostMapping("/register")
    @ResponseBody
    public Users register(@RequestBody  Users user){
        return  userService.addUser(user);
    }
}
