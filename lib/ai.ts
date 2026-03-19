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
      reasons.push("малоэтажная застройка хорошо подходит для частных домов");
    }
    if (normalized === "residential" || normalized === "residential complex") {
      score += 2;
      reasons.push("спрос на жилье в районе стабилен");
    }
    if (normalized === "commercial") {
      score -= 2;
      reasons.push("коммерческий поток в этой зоне умеренный");
    }
  }

  if (district === "Growing District") {
    if (normalized === "residential complex") {
      score += 4;
      reasons.push("сильная зона роста для плотной жилой застройки");
    }
    if (normalized === "residential") {
      score += 3;
      reasons.push("новая инфраструктура поддерживает жилищное развитие");
    }
    if (normalized === "house") {
      score += 1;
      reasons.push("возможно, но это не самый оптимальный формат");
    }
  }

  if (district === "Golden District") {
    if (normalized === "residential" || normalized === "commercial") {
      score += 3;
      reasons.push("сбалансированные условия для смешанного использования");
    }
    if (normalized === "residential complex") {
      score += 2;
      reasons.push("хорошее сочетание плотности и сервисов");
    }
    if (normalized === "house") {
      score += 1;
      reasons.push("подходит, но территория больше ориентирована на mixed-use");
    }
  }

  if (district === "Gate District") {
    if (normalized === "commercial") {
      score += 4;
      reasons.push("отличная логистика и транспортная доступность");
    }
    if (normalized === "residential" || normalized === "house") {
      score -= 1;
      reasons.push("комфорт проживания может снижаться из-за транспортной нагрузки");
    }
    if (normalized === "residential complex") {
      score -= 1;
      reasons.push("территория лучше подходит для коммерческой активности");
    }
  }

  const finalScore = clampScore(score);

  let recommendation = "Средний потенциал";
  if (finalScore >= 8) recommendation = "Рекомендуется";
  if (finalScore <= 4) recommendation = "Не рекомендуется";

  return {
    score: finalScore,
    recommendation,
    explanation: reasons.join("; ") || "Общий потенциал района нейтральный.",
  };
}
