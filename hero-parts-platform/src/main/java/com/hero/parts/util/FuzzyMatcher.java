package com.hero.parts.util;

import org.apache.commons.codec.language.Soundex;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Component;

@Component
public class FuzzyMatcher {

    private static final Soundex SOUNDEX = new Soundex();
    private static final LevenshteinDistance LEVENSHTEIN = LevenshteinDistance.getDefaultInstance();

    /**
     * Normalised similarity score between 0.0 and 1.0.
     * Uses Levenshtein distance on lowercased, trimmed strings.
     */
    public double similarity(String a, String b) {
        if (a == null || b == null) return 0.0;
        String s1 = a.toLowerCase().trim();
        String s2 = b.toLowerCase().trim();
        if (s1.equals(s2)) return 1.0;
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;
        int dist = LEVENSHTEIN.apply(s1, s2);
        return 1.0 - ((double) dist / maxLen);
    }

    /**
     * True when the Soundex code of the two strings matches —
     * catches phonetic misspellings like "brek" vs "brake".
     */
    public boolean soundexMatch(String a, String b) {
        if (a == null || b == null) return false;
        try {
            String code1 = SOUNDEX.encode(a.trim());
            String code2 = SOUNDEX.encode(b.trim());
            return code1 != null && code1.equals(code2);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * True when query is a contiguous substring of the target (case-insensitive).
     */
    public boolean containsIgnoreCase(String target, String query) {
        if (target == null || query == null) return false;
        return target.toLowerCase().contains(query.toLowerCase());
    }

    /**
     * Composite score: weights exact-contains higher than pure edit-distance.
     */
    public double score(String target, String query) {
        if (containsIgnoreCase(target, query)) return 0.95;
        double sim = similarity(target, query);
        if (soundexMatch(target, query)) sim = Math.max(sim, 0.70);
        return sim;
    }
}