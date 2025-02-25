package com.rishav.Eclipser.model;

import jakarta.persistence.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Users {

    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY) //automatically handles the userID allocation
    private int user_id;
    private String username;
    private String password;
    private String email;
    private LocalDateTime created_at;

    @PrePersist
    public void onCreate(){
        this.created_at= LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Users{" +
                "user_id=" + user_id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", created_at=" + created_at +
                '}';
    }

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }
}
