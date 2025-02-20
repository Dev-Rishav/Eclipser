package com.rishav.Eclipser.service;

import com.rishav.Eclipser.model.Users;
import com.rishav.Eclipser.repo.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UsersRepo repo;

    public Users addUser(Users user) {
        return  repo.save(user);
    }

//    public Users verify(Users user) {
//
//    }
}
