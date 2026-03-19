import { District, ProjectType } from "@/lib/shared";

export type ResidentRequestType = "house" | "residential complex";

export type AnalysisResult = {
  score: number;
  recommendation: string;
  explanation: string;
};

const clampScore = (score: number) => Math.min(10, Math.max(1, score));

const normalizeType = (
  type: ProjectType | ResidentRequestType,
): "house" | "residential" | "commercial" | "school" | "residential complex" => {
  if (type === "residential") {
    return "residential";
  }
  if (type === "commercial") {
    return "commercial";
  }
  if (type === "school") {
    return "school";
  }
  if (type === "house") {
    return "house";
  }
  return "residential complex";
};

export function analyzeDistrict(
  district: District,
  type: ProjectType | ResidentRequestType,
): AnalysisResult {
  const normalized = normalizeType(type);
  let score = 5;
  const reasons: string[] = [];

  if (district === "Green District") {
    if (normalized === "house") {
      score += 4;
      reasons.push("low-density planning supports private housing");
    }
    if (normalized === "residential" || normalized === "residential complex") {
      score += 2;
      reasons.push("residential demand is stable");
    }
    if (normalized === "commercial") {
      score -= 2;
      reasons.push("commercial flow is moderate here");
    }
  }

  if (district === "Growing District") {
    if (normalized === "residential complex") {
      score += 4;
      reasons.push("strong expansion zone for dense housing");
    }
    if (normalized === "residential") {
      score += 3;
      reasons.push("new infrastructure supports residential growth");
    }
    if (normalized === "house") {
      score += 1;
      reasons.push("possible but not the top fit");
    }
  }

  if (district === "Golden District") {
    if (normalized === "residential" || normalized === "commercial") {
      score += 3;
      reasons.push("balanced mixed-use conditions");
    }
    if (normalized === "residential complex") {
      score += 2;
      reasons.push("good blend of density and services");
    }
    if (normalized === "house") {
      score += 1;
      reasons.push("works, but space is more mixed-use oriented");
    }
  }

  if (district === "Gate District") {
    if (normalized === "commercial") {
      score += 4;
      reasons.push("excellent logistics and transport access");
    }
    if (normalized === "residential" || normalized === "house") {
      score -= 1;
      reasons.push("residential comfort can be affected by transit load");
    }
    if (normalized === "residential complex") {
      score -= 1;
      reasons.push("better suited for commercial activity");
    }
  }

  const finalScore = clampScore(score);

  let recommendation = "Average potential";
  if (finalScore >= 8) recommendation = "Suitable";
  if (finalScore <= 4) recommendation = "Not recommended";

  return {
    score: finalScore,
    recommendation,
    explanation: reasons.join("; ") || "General district potential is neutral.",
  };
}
