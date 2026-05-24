package com.hero.parts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.0-flash}")
    private String model;

    private static final String GEMINI_API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    private final ObjectMapper objectMapper;

    private static final String PROMPT = """
        You are a Hero MotoCorp spare-parts identification expert at a dealer workshop in India.
        Look at this image and identify what motorcycle spare part is shown.
        Return ONLY a comma-separated list of 4-6 search keywords, from most specific to most general.
        The first item must be the best-match part name. Include alternative names and component words.
        Examples:
          brake shoe  → brake shoe, brake, shoe, drum brake, braking, friction
          spark plug  → spark plug, plug, ignition, NGK, sparking, electrode
          air filter  → air filter, filter, air cleaner, intake, foam filter
          chain kit   → chain kit, chain, sprocket, drive chain, 428 chain
          bearing     → bearing, ball bearing, radial bearing, roller bearing, wheel bearing
        Return ONLY the comma-separated list. No explanation, no punctuation other than commas.
        """;

    /**
     * Sends the image to Gemini Vision and returns comma-separated search keywords.
     * First item is the primary part name; subsequent items are alternatives/component words.
     */
    public String analyzePartImage(byte[] imageBytes, String mediaType) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("Gemini API key not configured — add app.gemini.api-key to application.properties");
            return "";
        }

        try {
            String b64 = Base64.getEncoder().encodeToString(imageBytes);

            Map<String, Object> inlineData = Map.of(
                "mime_type", mediaType,
                "data", b64
            );
            Map<String, Object> imagePart = Map.of("inline_data", inlineData);
            Map<String, Object> textPart  = Map.of("text",
                "What Hero MotoCorp motorcycle spare part is shown? Give 4-6 comma-separated search keywords, most specific first.");

            Map<String, Object> body = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(imagePart, textPart))
                ),
                "systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", PROMPT))
                ),
                "generationConfig", Map.of(
                    "maxOutputTokens", 80,
                    "temperature", 0.1
                )
            );

            String url = String.format(GEMINI_API_URL, model, apiKey);
            String bodyJson = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .timeout(Duration.ofSeconds(25))
                .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API returned {}: {}", response.statusCode(), response.body());
                return "";
            }

            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("candidates").path(0)
                .path("content").path("parts").path(0)
                .path("text").asText("").strip();

            String cleaned = text.replaceAll("^[\"'`*\\-]+|[\"'`*\\-]+$", "").strip().toLowerCase();
            log.info("Gemini identified image as: '{}'", cleaned);
            return cleaned;

        } catch (Exception e) {
            log.error("Gemini image analysis failed: {}", e.getMessage(), e);
            return "";
        }
    }
}
