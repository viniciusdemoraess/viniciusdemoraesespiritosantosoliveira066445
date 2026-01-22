package br.gov.seplag.artistalbum.application.adapter;

import br.gov.seplag.artistalbum.application.service.RegionalSyncService;
import br.gov.seplag.artistalbum.domain.entity.Regional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/regionais")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Regionais", description = "External API integration for Polícia Civil regionais")
public class RegionalRestAdapter {

    private final RegionalSyncService regionalSyncService;

    @PostMapping("/sync")
    @Operation(summary = "Synchronize regionais", description = "Manually trigger synchronization with external API")
    public ResponseEntity<String> synchronize() {
        regionalSyncService.synchronize();
        return ResponseEntity.ok("Synchronization completed successfully");
    }

    @GetMapping
    @Operation(summary = "Get all regionais", description = "Get all regionais ordered by name")
    public ResponseEntity<List<Regional>> getAllRegionais() {
        List<Regional> regionais = regionalSyncService.getAllRegionais();
        return ResponseEntity.ok(regionais);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active regionais", description = "Get only active regionais")
    public ResponseEntity<List<Regional>> getActiveRegionais() {
        List<Regional> regionais = regionalSyncService.getAllActiveRegionais();
        return ResponseEntity.ok(regionais);
    }
}
