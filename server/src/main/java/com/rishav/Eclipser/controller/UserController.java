package com.rishav.Eclipser.controller;


import com.rishav.Eclipser.model.Users;
import com.rishav.Eclipser.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@CrossOrigin
@RestController
public class UserController {
    @Autowired
    private UserService userService;


    @PostMapping("/login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody Users user) {
        System.out.println("the incoming object is "+user);
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
