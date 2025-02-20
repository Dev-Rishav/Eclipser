package com.rishav.Eclipser.service;

import com.rishav.Eclipser.model.UserPrincipal;
import com.rishav.Eclipser.model.Users;
import com.rishav.Eclipser.repo.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {
    @Autowired
    private  UsersRepo usersRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user=usersRepo.findByUsername(username);
        if(user==null){
            System.out.println("user not found!");
            throw new UsernameNotFoundException("user not found");
        }
        return new UserPrincipal(user);
    }
}
