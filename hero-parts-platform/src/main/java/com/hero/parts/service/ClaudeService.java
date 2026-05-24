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
public class ClaudeService {

    @Value("${app.claude.api-key:}")
    private String apiKey;

    @Value("${app.claude.model:claude-haiku-4-5-20251001}")
    private String model;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are a spare-parts assistant at a Hero MotoCorp workshop in India.
            A mechanic has typed or spoken a search query. It may be in ANY Indian language or script —
            Hindi, Marathi, Bengali, Tamil, Kannada, Telugu, Punjabi — or Hinglish / regional-English mix,
            slang, phonetic misspelling, symptom phrase, or brand name.
            Map it to the best-matching canonical English search term from the AVAILABLE PARTS list below.

            AVAILABLE PARTS — canonical term | known aliases across Indian languages:
            - mirror           | aaina, arse, arsa, aarse (Marathi), ayna, aina (Bengali), kannadi (Tamil/Kannada), addam (Telugu), saida, aaina, rear view mirror, side mirror
            - spark plug       | masala, masale, bujji, NGK, denso, sparking nahi, miss fire, misfire, spark plag
            - engine oil       | tel, tela, enne (Kannada), nune (Telugu), ennai (Tamil), mobil, servo, castrol, tabbdil, 10w30, motor oil
            - battery          | batri, amaron, exide, self start nahi, battery down, charging nahi, gari start hot nahi (Marathi), gari chole na (Bengali), bike start aagalai (Tamil), gaadi start aagutilla (Kannada), gaadi start avvadam ledu (Telugu)
            - shock absorber   | shocker, shockar, shokr, rear shocker, jhakka aata hai
            - front fork       | front suspension, agla kanta, fork assembly, kanta
            - fork oil seal    | fork seal, tel seal fork, fork leak, aage se tel tapakna, tel galaw (Marathi), tel sorthide (Kannada), tel karisthundi (Telugu)
            - headlight bulb   | batti, head light, light nahi jal rahi, batti nahi, diva (Marathi), alo (Bengali), vilakku (Tamil), deepa (Kannada), veluturu (Telugu), light ezhalai (Tamil), light baralla (Kannada), light ravadam ledu (Telugu)
            - indicator bulb   | indicator batti, blinker, dikhavni batti, indicator nahi
            - CDI unit         | cdi box, ignition module, start nahi hona
            - carburettor      | carbi, carburator, carbrate, mileage kharab, petrol nahi aa raha, mileage kami (Marathi)
            - clutch plate     | fiber, fibre, gear nahi lag raha, clutch slip, clutch phisalta hai, ghissi plate, gear lagat nahi (Marathi), gear lagche na (Bengali), gear poda mudiyalai (Tamil), gear haakalla (Kannada), gear padadam ledu (Telugu)
            - clutch cable     | clutch taar, cluch cable, clutch wire
            - drive chain      | zanjeer, patta, chakri, chakradant, tara, chein, 428 chain, chain kit, garari, sprocket, sakhali (Marathi), shikal (Bengali), sangiliy (Tamil), chainu (Kannada), golusu (Telugu)
            - brake shoe       | brake lining, lining, liner, drum brake, brake nahi lag raha, brake lagat nahi (Marathi), brake lagche na (Bengali), brake pidikalai (Tamil), brake haakalla (Kannada), brake paddham ledu (Telugu)
            - brake cable      | brake wire rear, pichla brake taar, brake taar
            - tyre             | tire, pahiya, paiya, pehiya, chakka, tiar, tirr, chaak (Marathi), chaka (Bengali), chakram (Tamil/Telugu)
            - inner tube       | tube, agla tube, pichla tube, front tube, rear tube, ander ki nali
            - mudguard         | fender, mudgard, aage ka mudgard, front mudguard, rear mudguard
            - saree guard      | ladies guard, leg guard, sari guard, dupatta guard, mahila guard
            - side panel       | side cover, sayd panel, body panel
            - fuel tank cap    | tank cap, petrol tank dhakkan, fuel cap, dhakkan
            - fuel petcock     | petcock, petrol cock, tap, fuel valve, petrol band karne wala, petrol nali
            - speedometer      | meter, speedo, speed meter, meter cable, speedo cable, meter nahi chalta
            - horn             | horn nahi, horn vajat nahi (Marathi), horn bajche na (Bengali), horn adicha sound illai (Tamil), horn hothilla (Kannada), horn vokkadam ledu (Telugu)
            - camshaft         | cam shaft, kamshaft, valve timing, engine shaft

            COLOUR WORDS — translate in-place and keep with the part name:
            laal/lal=red, safed=white, kala/kaala=black, neela=blue, peela=yellow, hara=green,
            sivappu=red (Tamil), karuppu=black (Tamil), velai=white (Tamil)

            POSITION WORDS — translate in-place:
            aage/agla=front, peeche/pichla=rear, baaya=left, daaya=right,
            pudhe=front (Marathi), mage=rear (Marathi), amne=front (Bengali), pichone=rear (Bengali)

            INSTRUCTIONS:
            - Return ONLY the canonical English search term — 1 to 5 words, no explanation, no punctuation, no quotes.
            - Always pick the closest AVAILABLE PART. Never invent a part not on the list.
            - If the query describes a symptom, return the most likely faulty part name.
            - If the query contains a recognisable part name with extra context words, return ONLY the part name.
              Examples: "engine spark plug" → "spark plug", "replace air filter" → "air filter",
              "check engine oil" → "engine oil", "front brake shoe" → "brake shoe" (keep position only if it is a meaningful part qualifier like front/rear).
            - If the query is already a clean English part name from the list with no extra words, return it unchanged (lowercase).
            - Native script queries (Tamil: கண்ணாடி, Telugu: అద్దం, Kannada: ಕನ್ನಡಿ, Bengali: আয়না, Marathi: आरसा etc.) must be correctly translated.
            """;

    private static final String IMAGE_PROMPT = """
            You are a Hero MotoCorp spare-parts identification expert.
            Look at this image of a motorcycle part.
            Return ONLY a comma-separated list of 4-6 search keywords, from most specific to most general.
            The first item must be the best-match part name. Include alternative names, component words, and category words.
            Examples:
              brake shoe  → brake shoe, brake, shoe, drum brake, braking, friction
              spark plug  → spark plug, plug, ignition, NGK, sparking, electrode
              air filter  → air filter, filter, air cleaner, intake, foam filter
              chain kit   → chain kit, chain, sprocket, drive chain, 428 chain
            Return ONLY the comma-separated list. No explanation, no punctuation other than commas.
            """;

    /**
     * Returns a comma-separated list of search keywords derived from the image.
     * First item is the primary identified part name; subsequent items are alternatives/component words.
     */
    public String analyzePartImage(byte[] imageBytes, String mediaType) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("Claude API key not configured — image search unavailable");
            return "";
        }
        try {
            String b64 = Base64.getEncoder().encodeToString(imageBytes);
            List<Map<String, Object>> content = List.of(
                Map.of("type", "image", "source", Map.of(
                    "type", "base64",
                    "media_type", mediaType,
                    "data", b64
                )),
                Map.of("type", "text", "text",
                    "What motorcycle spare part is shown? Give 4-6 comma-separated search keywords, most specific first.")
            );

            String bodyJson = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "max_tokens", 80,
                "system", IMAGE_PROMPT,
                "messages", List.of(Map.of("role", "user", "content", content))
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CLAUDE_API_URL))
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .timeout(Duration.ofSeconds(20))
                .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Claude image API returned {}: {}", response.statusCode(), response.body());
                return "";
            }

            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("content").path(0).path("text").asText("").strip();
            String cleaned = text.replaceAll("^[\"'`*\\-]+|[\"'`*\\-]+$", "").strip().toLowerCase();
            log.info("Claude image keywords: '{}'", cleaned);
            return cleaned;

        } catch (Exception e) {
            log.error("Claude image analysis failed: {}", e.getMessage(), e);
            return "";
        }
    }

    public String expandSearchQuery(String query) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("Claude API key not configured — add app.claude.api-key to application.properties");
            return query;
        }

        try {
            String bodyJson = objectMapper.writeValueAsString(Map.of(
                    "model", model,
                    "max_tokens", 40,
                    "system", SYSTEM_PROMPT,
                    "messages", List.of(Map.of("role", "user", "content", "Query: \"" + query + "\""))
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLAUDE_API_URL))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Claude API returned HTTP {} for query '{}': {}", response.statusCode(), query, response.body());
                return query;
            }

            JsonNode root = objectMapper.readTree(response.body());
            String text = root.path("content").path(0).path("text").asText("").strip();
            if (!text.isBlank()) {
                String cleaned = text.replaceAll("^[\"'`]+|[\"'`]+$", "").strip();
                log.info("Claude expanded '{}' → '{}'", query, cleaned);
                return cleaned;
            }

        } catch (Exception e) {
            log.error("Claude expansion failed for '{}': {}", query, e.getMessage(), e);
        }

        return query;
    }
}
