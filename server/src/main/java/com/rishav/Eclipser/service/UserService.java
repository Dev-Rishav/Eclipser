package com.rishav.Eclipser.service;

import com.rishav.Eclipser.model.Users;
import com.rishav.Eclipser.repo.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UsersRepo repo;

    private final int saltRounds=12;

    private BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(saltRounds);

    public Users addUser(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return  repo.save(user);
    }

//    public Users verify(Users user) {
//
//    }
}
