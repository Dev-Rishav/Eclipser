package com.rishav.Eclipser.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.server.authentication.WebFilterChainServerAuthenticationSuccessHandler;

@Configuration
public class SecurityConfig extends WebFilterChainServerAuthenticationSuccessHandler {
}
