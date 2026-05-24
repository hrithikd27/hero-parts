package com.hero.parts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudVisionService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private final ObjectMapper objectMapper;

    public List<String> identifyPart(byte[] imageBytes) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.error("[VISION] Gemini API key not configured");
            return List.of();
        }
        try {
            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            String requestBody = buildRequest(base64);
            String response = callGemini(requestBody);
            if (response == null || response.isBlank()) return List.of();
            return parseResponse(response);
        } catch (Exception e) {
            log.error("[VISION] Gemini Vision request failed: {}", e.getMessage(), e);
            return List.of();
        }
    }

    // Sentinel returned when the image is not a vehicle/automotive part
    public static final String NOT_A_PART = "__NOT_A_PART__";

    private String buildRequest(String base64Image) throws Exception {
        String prompt =
            "Look at this image carefully.\n\n" +
            "Does this image show a motorcycle part, vehicle spare part, or mechanical component " +
            "from an automotive repair shop (e.g. brake, engine part, filter, chain, bearing, lever, etc.)?\n\n" +
            "If YES: list the 4 most likely motorcycle/vehicle spare part names visible, " +
            "one per line, using technical terms from repair shops. Output only the part names, no numbering.\n\n" +
            "If NO (the image shows a landscape, bridge, ocean, people, animals, food, buildings, " +
            "or anything unrelated to vehicle parts): reply with exactly one word: NOT_A_PART";

        String json = objectMapper.writeValueAsString(
            objectMapper.createObjectNode()
                .set("contents", objectMapper.createArrayNode()
                    .add(objectMapper.createObjectNode()
                        .set("parts", objectMapper.createArrayNode()
                            .add(objectMapper.createObjectNode()
                                .set("inlineData", objectMapper.createObjectNode()
                                    .put("mimeType", "image/jpeg")
                                    .put("data", base64Image)))
                            .add(objectMapper.createObjectNode()
                                .put("text", prompt))))));
        return json;
    }

    private String callGemini(String requestBody) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(GEMINI_URL + geminiApiKey).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(15_000);
        conn.setReadTimeout(30_000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes("UTF-8"));
        }

        int status = conn.getResponseCode();
        InputStream is = status == 200 ? conn.getInputStream() : conn.getErrorStream();
        String responseBody = is == null ? "" : new String(is.readAllBytes());

        if (status != 200) {
            log.error("[VISION] Gemini returned {}: {}", status, responseBody);
            return null;
        }
        return responseBody;
    }

    private List<String> parseResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String text = root.path("candidates").path(0)
            .path("content").path("parts").path(0)
            .path("text").asText("").trim();

        log.info("[VISION] Gemini identified: '{}'", text);

        if (text.isBlank()) return List.of();

        // Gemini flagged the image as irrelevant to vehicle parts
        if (text.strip().equalsIgnoreCase("NOT_A_PART") || text.strip().startsWith("NOT_A_PART")) {
            return List.of(NOT_A_PART);
        }

        Set<String> labels = new LinkedHashSet<>();
        for (String line : text.split("\n")) {
            String cleaned = line.replaceAll("^[\\d\\-\\*\\.\\)\\s]+", "").trim().toLowerCase();
            if (!cleaned.isBlank() && cleaned.length() >= 3) {
                labels.add(cleaned);
            }
        }

        return new ArrayList<>(labels).subList(0, Math.min(labels.size(), 4));
    }
}
