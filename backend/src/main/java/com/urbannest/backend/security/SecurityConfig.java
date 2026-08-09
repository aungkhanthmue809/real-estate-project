package com.urbannest.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.exceptionHandling(ex -> ex
				.authenticationEntryPoint((request, response, authException) -> {
					response.setStatus(HttpStatus.UNAUTHORIZED.value());
					response.setContentType("application/json;charset=UTF-8");
					response.getWriter().write("{\"message\":\"Not logged in or bad token\"}");
				})
				.accessDeniedHandler((request, response, accessDeniedException) -> {
					response.setStatus(HttpStatus.FORBIDDEN.value());
					response.setContentType("application/json;charset=UTF-8");
					response.getWriter().write("{\"message\":\"Not allowed\"}");
				}))
			.authorizeHttpRequests(auth -> auth
				// Auth endpoints
				.requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
				// Own profile (must come before admin user-management wildcards)
				.requestMatchers(HttpMethod.PUT, "/api/users/me", "/api/users/me/password").authenticated()
				// Admin user management
				.requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
				.requestMatchers(HttpMethod.PUT, "/api/users/*").hasRole("ADMIN")
				.requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")
				// Seller property routes (mine before public {id} pattern)
				.requestMatchers(HttpMethod.GET, "/api/properties/mine").authenticated()
				.requestMatchers(HttpMethod.POST, "/api/properties").authenticated()
				.requestMatchers(HttpMethod.PUT, "/api/properties/*").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/properties/*").authenticated()
				// Public property read
				.requestMatchers(HttpMethod.GET, "/api/properties", "/api/properties/*").permitAll()
				// Favorites
				.requestMatchers("/api/favorites", "/api/favorites/**").authenticated()
				.requestMatchers(HttpMethod.POST, "/api/properties/*/favorite").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/properties/*/favorite").authenticated()
				// Admin property management
				.requestMatchers("/api/admin/**").hasRole("ADMIN")
				.anyRequest().authenticated())
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:5173"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
