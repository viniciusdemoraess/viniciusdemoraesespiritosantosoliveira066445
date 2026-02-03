package br.gov.seplag.artistalbum.application.adapter;

import br.gov.seplag.artistalbum.application.io.DashboardStatsResponse;
import br.gov.seplag.artistalbum.application.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics and aggregated data")
public class DashboardRestAdapter {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics", description = "Returns aggregated statistics for the dashboard including artist and album counts, averages, and recent albums")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        log.info("GET /api/v1/dashboard/stats - Fetching dashboard statistics");
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
