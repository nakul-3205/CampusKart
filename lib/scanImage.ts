import axios from "axios";
import { off } from "process";

export async function scanImageNSFW(
  imageUrl: string
): Promise<{ safe: boolean; reason?: string }> {
  try {
    const { data } = await axios.get("https://api.sightengine.com/1.0/check.json", {
      params: {
        url: imageUrl,
        models: "nudity,wad,offensive,gore,scam,violence",
        api_user: process.env.SIGHTENGINE_USER,
        api_secret: process.env.SIGHTENGINE_SECRET,
      },
    });

    if (data.status !== "success") {
      return {
        safe: false,
        reason: "Sightengine API failed to process image",
      };
    }

    const nudity = data.nudity || {};
    const offensive = data.offensive || {};
    const scam = data.scam || {};
    const drugs = typeof data.drugs?.prob === "number" ? data.drugs.prob : 0;
    const gore = data.gore || {};
    const violence = data.violence || {};
    const weapon = typeof data.weapon === "number" ? data.weapon : 0;
    const weapon_firearm = typeof data.weapon_firearm === "number" ? data.weapon_firearm : 0;
    console.log(nudity,offensive,scam,drugs,gore,violence,weapon,weapon_firearm)

    const unsafe = [
      nudity.raw > 0.8,
      nudity.partial > 0.8,
      offensive.prob > 0.85,
      scam.prob > 0.9,
      drugs > 0.6,
      gore.prob > 0.6,
      violence.prob > 0.9,
      weapon > 0.8,
      weapon_firearm > 0.8,
    ];

    const isUnsafe = unsafe.some(Boolean);

    return isUnsafe
      ? { safe: false, reason: "Image flagged by Sightengine" }
      : { safe: true };
  } catch (error: any) {
    console.error("Sightengine API failed:", {
      message: error.message,
      response: error?.response?.data,
    });

    return {
      safe: false,
      reason: "Sightengine API error",
    };
  }
}
