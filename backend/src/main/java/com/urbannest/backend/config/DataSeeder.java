package com.urbannest.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.urbannest.backend.model.Role;
import com.urbannest.backend.model.User;
import com.urbannest.backend.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		if (userRepository.count() == 0) {
			User admin = new User();
			admin.setUsername("admin");
			admin.setEmail("admin@urbannest.com");
			admin.setPassword(passwordEncoder.encode("admin12345"));
			admin.setPhone("09-000000001");
			admin.setRole(Role.ADMIN);
			userRepository.save(admin);

			User demo = new User();
			demo.setUsername("demo");
			demo.setEmail("demo@urbannest.com");
			demo.setPassword(passwordEncoder.encode("demo12345"));
			demo.setPhone("09-000000002");
			demo.setRole(Role.USER);
			userRepository.save(demo);
		}
	}
}
