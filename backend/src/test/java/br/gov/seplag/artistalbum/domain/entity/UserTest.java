package br.gov.seplag.artistalbum.domain.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("User Entity Tests")
class UserTest {

    @Test
    @DisplayName("Should create user with builder")
    void shouldCreateUserWithBuilder() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .fullName("Test User")
                .enabled(true)
                .build();

        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getUsername()).isEqualTo("testuser");
        assertThat(user.getPassword()).isEqualTo("password123");
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getFullName()).isEqualTo("Test User");
        assertThat(user.getEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should create user with no-args constructor")
    void shouldCreateUserWithNoArgsConstructor() {
        User user = new User();
        
        assertThat(user).isNotNull();
        assertThat(user.getId()).isNull();
        assertThat(user.getUsername()).isNull();
    }

    @Test
    @DisplayName("Should create user with all-args constructor")
    void shouldCreateUserWithAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        
        User user = new User(
                1L,
                "john.doe",
                "securepass",
                "john@example.com",
                "John Doe",
                true,
                now,
                now
        );

        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getUsername()).isEqualTo("john.doe");
        assertThat(user.getPassword()).isEqualTo("securepass");
        assertThat(user.getEmail()).isEqualTo("john@example.com");
        assertThat(user.getFullName()).isEqualTo("John Doe");
        assertThat(user.getEnabled()).isTrue();
        assertThat(user.getCreatedAt()).isEqualTo(now);
        assertThat(user.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        User user = new User();
        LocalDateTime now = LocalDateTime.now();

        user.setId(5L);
        user.setUsername("newuser");
        user.setPassword("newpass");
        user.setEmail("new@example.com");
        user.setFullName("New User");
        user.setEnabled(false);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        assertThat(user.getId()).isEqualTo(5L);
        assertThat(user.getUsername()).isEqualTo("newuser");
        assertThat(user.getPassword()).isEqualTo("newpass");
        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(user.getFullName()).isEqualTo("New User");
        assertThat(user.getEnabled()).isFalse();
        assertThat(user.getCreatedAt()).isEqualTo(now);
        assertThat(user.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should return ROLE_USER authority")
    void shouldReturnRoleUserAuthority() {
        User user = User.builder()
                .username("testuser")
                .password("password")
                .email("test@example.com")
                .build();

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertThat(authorities).hasSize(1);
        assertThat(authorities.iterator().next().getAuthority()).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Should return true for isAccountNonExpired")
    void shouldReturnTrueForIsAccountNonExpired() {
        User user = new User();
        assertThat(user.isAccountNonExpired()).isTrue();
    }

    @Test
    @DisplayName("Should return true for isAccountNonLocked")
    void shouldReturnTrueForIsAccountNonLocked() {
        User user = new User();
        assertThat(user.isAccountNonLocked()).isTrue();
    }

    @Test
    @DisplayName("Should return true for isCredentialsNonExpired")
    void shouldReturnTrueForIsCredentialsNonExpired() {
        User user = new User();
        assertThat(user.isCredentialsNonExpired()).isTrue();
    }

    @Test
    @DisplayName("Should return enabled status for isEnabled")
    void shouldReturnEnabledStatusForIsEnabled() {
        User enabledUser = User.builder()
                .username("enabled")
                .password("pass")
                .email("enabled@example.com")
                .enabled(true)
                .build();

        User disabledUser = User.builder()
                .username("disabled")
                .password("pass")
                .email("disabled@example.com")
                .enabled(false)
                .build();

        assertThat(enabledUser.isEnabled()).isTrue();
        assertThat(disabledUser.isEnabled()).isFalse();
    }

    @Test
    @DisplayName("Should set timestamps on onCreate")
    void shouldSetTimestampsOnCreate() {
        User user = new User();
        
        user.onCreate();

        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
        assertThat(user.getCreatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
        assertThat(user.getUpdatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should update timestamp on onUpdate")
    void shouldUpdateTimestampOnUpdate() throws InterruptedException {
        User user = new User();
        user.onCreate();
        
        LocalDateTime originalUpdatedAt = user.getUpdatedAt();
        Thread.sleep(10);
        user.onUpdate();

        assertThat(user.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    @DisplayName("Should have default enabled value as true in builder")
    void shouldHaveDefaultEnabledValueInBuilder() {
        User user = User.builder()
                .username("defaultuser")
                .password("pass")
                .email("default@example.com")
                .build();

        assertThat(user.getEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should handle null full name")
    void shouldHandleNullFullName() {
        User user = User.builder()
                .username("noname")
                .password("pass")
                .email("noname@example.com")
                .fullName(null)
                .build();

        assertThat(user.getFullName()).isNull();
    }
}
