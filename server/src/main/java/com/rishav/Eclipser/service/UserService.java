package com.rishav.Eclipser.service;

import com.rishav.Eclipser.dto.UserDTO;
import com.rishav.Eclipser.model.Users;
import com.rishav.Eclipser.repo.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UsersRepo repo;

    private final int saltRounds=12;

    private BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(saltRounds);

    public Users addUser(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return  repo.save(user);
    }

    public Map<String,Object> verify(Users user) {
        Authentication authentication=
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(user.getUsername(),user.getPassword())
                );
        if(authentication.isAuthenticated()) {
//            return jwtService.generateToken(user.getUsername());
            String token=jwtService.generateToken(user.getUsername());
            Users authenticatedUser=repo.findByUsername(user.getUsername());
            System.out.println(token+"token");
            UserDTO userDTO=new UserDTO();
            userDTO.setUsername(authenticatedUser.getUsername());

            Map<String, Object> res=new HashMap<>();
            res.put("token",token);
            res.put("user",userDTO);
            return res;
        }
        else
            return Collections.singletonMap("Message","failure");
    }

}
