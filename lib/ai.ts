import { District, Project, ProjectType } from "@/lib/shared";

export type ResidentRequestType = "house" | "residential complex";

export type AnalysisResult = {
  score: number;
  recommendation: string;
  explanation: string;
};

export type ResidentProfile = {
  hasChildren: boolean;
  budget: "low" | "medium" | "high";
  preferredHomeType: ResidentRequestType;
  prioritizeSafety: boolean;
  prioritizeSchools: boolean;
  prioritizeTransport: boolean;
};

export type DistrictRecommendation = {
  district: District;
  score: number;
  reasons: string[];
};

const clampScore = (score: number) => Math.min(10, Math.max(1, score));

const DISTRICT_VALUES: District[] = [
  "Green District",
  "Growing District",
  "Golden District",
  "Gate District",
];

type DistrictStats = {
  schoolsReady: number;
  schoolsPlanned: number;
  residentialReady: number;
  residentialPlanned: number;
  commercialActive: number;
  total: number;
};

function getDistrictStats(projects: Project[]): Record<District, DistrictStats> {
  const initial: DistrictStats = {
    schoolsReady: 0,
    schoolsPlanned: 0,
    residentialReady: 0,
    residentialPlanned: 0,
    commercialActive: 0,
    total: 0,
  };

  const stats = Object.fromEntries(
    DISTRICT_VALUES.map((district) => [district, { ...initial }]),
  ) as Record<District, DistrictStats>;

  for (const project of projects) {
    const districtStats = stats[project.district];
    districtStats.total += 1;

    if (project.type === "school") {
      if (project.status === "completed" || project.status === "in progress") {
        districtStats.schoolsReady += 1;
      } else {
        districtStats.schoolsPlanned += 1;
      }
    }

    if (project.type === "residential") {
      if (project.status === "completed" || project.status === "in progress") {
        districtStats.residentialReady += 1;
      } else {
        districtStats.residentialPlanned += 1;
      }
    }

    if (project.type === "commercial" && project.status !== "completed") {
      districtStats.commercialActive += 1;
    }
  }

  return stats;
}

export function recommendDistrictsForResident(
  projects: Project[],
  profile: ResidentProfile,
): DistrictRecommendation[] {
  const stats = getDistrictStats(projects);

  const recommendations = DISTRICT_VALUES.map((district) => {
    const districtStats = stats[district];
    const reasons: string[] = [];

    let score = analyzeDistrict(district, profile.preferredHomeType).score;

    if (profile.hasChildren) {
      score += districtStats.schoolsReady * 2;
      score += districtStats.schoolsPlanned * 1;
      if (districtStats.schoolsReady > 0) {
        reasons.push("в районе уже есть работающие или строящиеся школы");
      }
    }

    if (profile.prioritizeSchools) {
      score += districtStats.schoolsReady * 2;
      if (districtStats.schoolsReady === 0) {
        score -= 1;
        reasons.push("образовательная инфраструктура пока ограничена");
      }
    }

    const safetyPenalty = districtStats.commercialActive + districtStats.residentialPlanned;
    if (profile.prioritizeSafety) {
      score -= safetyPenalty * 0.8;
      if (safetyPenalty <= 1) {
        reasons.push("нагрузка стройки и коммерческого трафика сравнительно низкая");
      }
      if (safetyPenalty >= 3) {
        reasons.push("возможна повышенная строительная и транспортная нагрузка");
      }
    }

    if (profile.prioritizeTransport) {
      if (district === "Gate District" || district === "Growing District") {
        score += 2;
        reasons.push("хорошая транспортная доступность и логистика");
      }
    }

    if (profile.budget === "low") {
      if (district === "Growing District" || district === "Gate District") {
        score += 1.5;
        reasons.push("район подходит для более доступного входа в покупку жилья");
      }
    }

    if (profile.budget === "high") {
      if (district === "Green District" || district === "Golden District") {
        score += 1.5;
        reasons.push("район чаще выбирают для комфортного долгосрочного проживания");
      }
    }

    if (districtStats.total === 0) {
      score -= 1;
      reasons.push("по району пока мало данных по проектам");
    }

    if (reasons.length === 0) {
      reasons.push("сбалансированная картина по текущим проектам");
    }

    return {
      district,
      score: clampScore(score),
      reasons,
    };
  });

  return recommendations.sort((a, b) => b.score - a.score);
}

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
