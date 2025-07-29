import axios from "axios";

interface HiveModerationResult {
  safe: boolean;
  reason?: string;
  flaggedClasses?: string[];
}

const FLAGGED_CATEGORIES = [
  "alcohol",
  "cigarette",
  "cigar",
  "hookah",
  "smoking",
  "drugs",
  "drug paraphernalia",
  "blunt",
  "joint",
  "substance use",
  "vape",
  "shisha",
  "bong",
  "beer",
  "whiskey",
  "wine",
  "vodka",
];

export async function scanHive(imageUrl: string): Promise<HiveModerationResult> {
  const HIVE_API_KEY = process.env.HIVE_API_KEY!;
  const HIVE_API_URL =
    process.env.HIVE_API_URL || "https://api.thehive.ai/api/v3/hive/visual-moderation";

  try {
    const response = await axios.post(
      HIVE_API_URL,
      {
        input: [
          {
            media_url: imageUrl,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${HIVE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const output = response.data?.output?.[0];
    const classesArray = output?.classes || [];

    const flagged: string[] = [];

    for (const item of classesArray) {
      const className = item.class.toLowerCase();
      const score = item.value;

      // If class matches our flagged list AND confidence is strong
      if (FLAGGED_CATEGORIES.includes(className) && score > 0.45) {
        flagged.push(`${className} (${score.toFixed(2)})`);
      }
    }

    const isSafe = flagged.length === 0;

    return {
      safe: isSafe,
      reason: isSafe ? undefined : `Flagged: ${flagged.join(", ")}`,
      flaggedClasses: isSafe ? [] : flagged,
    };
  } catch (error: any) {
    console.error("Hive API error:", error.response?.data || error.message);
    return {
      safe: false,
      reason: "Hive API error",
    };
  }
}
