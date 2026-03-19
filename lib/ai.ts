import { Complaint, District, Project, ProjectType } from "@/lib/shared";

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

export type ContractorRecommendation = {
  developerId: string;
  developerName: string;
  score: number;
  matchedCompleted: number;
  matchedTotal: number;
  totalProjects: number;
  totalComplaints: number;
  complaintRate: number;
  reasons: string[];
};

export type PlotLandUse = "residential" | "mixed" | "industrial";

export type HousingPlotCandidate = {
  id: string;
  name: string;
  district: District;
  areaHa: number;
  landUse: PlotLandUse;
  withinMasterPlan: boolean;
  hasOwnershipDispute: boolean;
  hasProtectedZone: boolean;
  hasRedLineConflict: boolean;
  hasSanitaryConflict: boolean;
  distanceToSchoolKm: number;
  distanceToTransitKm: number;
  utilityLoad: number;
  trafficRisk: number;
  seismicRisk: number;
};

export type LegalCheckResult = {
  code: string;
  label: string;
  passed: boolean;
  critical: boolean;
};

export type HousingPlotRecommendation = {
  plotId: string;
  plotName: string;
  district: District;
  capacityUnits: number;
  legalPassed: boolean;
  legalChecks: LegalCheckResult[];
  score: number;
  riskLevel: "low" | "medium" | "high";
  reasons: string[];
};

export type SelectedHousingPlot = {
  plotId: string;
  plotName: string;
  district: District;
  plannedUnits: number;
  score: number;
};

export type HousingPlanResult = {
  targetUnits: number;
  totalPlannedUnits: number;
  uncoveredUnits: number;
  legalRejectedCount: number;
  recommendations: HousingPlotRecommendation[];
  selectedPlan: SelectedHousingPlot[];
  insights: string[];
};

export type UrbanDistrictPlacement = {
  district: District;
  score: number;
  zoningFit: number;
  localNeed: number;
  mobilityImpact: number;
  estimatedDailyTripReduction: number;
  estimatedDailyCo2ReductionKg: number;
  reasons: string[];
};

export type UrbanPlacementPlan = {
  targetType: ProjectType;
  strictZoning: boolean;
  ranking: UrbanDistrictPlacement[];
  recommendedDistrict: District | null;
  estimatedDailyTripReduction: number;
  estimatedDailyCo2ReductionKg: number;
};

export const HOUSING_PLOT_CANDIDATES: HousingPlotCandidate[] = [
  {
    id: "plot-g1",
    name: "Green North Parcel",
    district: "Green District",
    areaHa: 8.4,
    landUse: "residential",
    withinMasterPlan: true,
    hasOwnershipDispute: false,
    hasProtectedZone: false,
    hasRedLineConflict: false,
    hasSanitaryConflict: false,
    distanceToSchoolKm: 0.9,
    distanceToTransitKm: 1.2,
    utilityLoad: 0.38,
    trafficRisk: 0.33,
    seismicRisk: 0.36,
  },
  {
    id: "plot-o1",
    name: "Growth East Expansion",
    district: "Growing District",
    areaHa: 11.7,
    landUse: "mixed",
    withinMasterPlan: true,
    hasOwnershipDispute: false,
    hasProtectedZone: false,
    hasRedLineConflict: false,
    hasSanitaryConflict: false,
    distanceToSchoolKm: 1.7,
    distanceToTransitKm: 0.8,
    utilityLoad: 0.52,
    trafficRisk: 0.47,
    seismicRisk: 0.41,
  },
  {
    id: "plot-y1",
    name: "Golden Riverside Block",
    district: "Golden District",
    areaHa: 6.3,
    landUse: "mixed",
    withinMasterPlan: true,
    hasOwnershipDispute: false,
    hasProtectedZone: true,
    hasRedLineConflict: false,
    hasSanitaryConflict: false,
    distanceToSchoolKm: 0.7,
    distanceToTransitKm: 0.9,
    utilityLoad: 0.49,
    trafficRisk: 0.58,
    seismicRisk: 0.4,
  },
  {
    id: "plot-b1",
    name: "Gate Logistics Fringe",
    district: "Gate District",
    areaHa: 14.8,
    landUse: "industrial",
    withinMasterPlan: true,
    hasOwnershipDispute: false,
    hasProtectedZone: false,
    hasRedLineConflict: false,
    hasSanitaryConflict: true,
    distanceToSchoolKm: 2.6,
    distanceToTransitKm: 0.6,
    utilityLoad: 0.61,
    trafficRisk: 0.73,
    seismicRisk: 0.45,
  },
  {
    id: "plot-g2",
    name: "Green South Redevelopment",
    district: "Green District",
    areaHa: 9.5,
    landUse: "residential",
    withinMasterPlan: true,
    hasOwnershipDispute: false,
    hasProtectedZone: false,
    hasRedLineConflict: false,
    hasSanitaryConflict: false,
    distanceToSchoolKm: 1.1,
    distanceToTransitKm: 1.6,
    utilityLoad: 0.35,
    trafficRisk: 0.29,
    seismicRisk: 0.34,
  },
  {
    id: "plot-o2",
    name: "Growing Central Corridor",
    district: "Growing District",
    areaHa: 7.9,
    landUse: "mixed",
    withinMasterPlan: true,
    hasOwnershipDispute: true,
    hasProtectedZone: false,
    hasRedLineConflict: false,
    hasSanitaryConflict: false,
    distanceToSchoolKm: 1.3,
    distanceToTransitKm: 0.7,
    utilityLoad: 0.57,
    trafficRisk: 0.51,
    seismicRisk: 0.39,
  },
];

const clampScore = (score: number) => Math.min(10, Math.max(1, score));

const DISTRICT_VALUES: District[] = [
  "Green District",
  "Growing District",
  "Golden District",
  "Gate District",
];

const DISTRICT_DISTANCE_KM: Record<District, Record<District, number>> = {
  "Green District": {
    "Green District": 0,
    "Growing District": 2.2,
    "Golden District": 3.6,
    "Gate District": 5.1,
  },
  "Growing District": {
    "Green District": 2.2,
    "Growing District": 0,
    "Golden District": 2.4,
    "Gate District": 3.5,
  },
  "Golden District": {
    "Green District": 3.6,
    "Growing District": 2.4,
    "Golden District": 0,
    "Gate District": 2.8,
  },
  "Gate District": {
    "Green District": 5.1,
    "Growing District": 3.5,
    "Golden District": 2.8,
    "Gate District": 0,
  },
};

const DISTRICT_ZONING_FIT: Record<District, Record<ProjectType, number>> = {
  "Green District": {
    residential: 0.9,
    school: 0.92,
    commercial: 0.45,
  },
  "Growing District": {
    residential: 0.95,
    school: 0.8,
    commercial: 0.75,
  },
  "Golden District": {
    residential: 0.45,
    school: 0.28,
    commercial: 0.98,
  },
  "Gate District": {
    residential: 0.3,
    school: 0.35,
    commercial: 0.95,
  },
};

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

export function recommendContractorsForProject(
  projects: Project[],
  complaints: Complaint[],
  targetType: ProjectType,
  targetDistrict?: District,
): ContractorRecommendation[] {
  const complaintsByProject = new Map<string, number>();
  for (const complaint of complaints) {
    complaintsByProject.set(complaint.projectId, (complaintsByProject.get(complaint.projectId) ?? 0) + 1);
  }

  const byDeveloper = new Map<string, Project[]>();
  for (const project of projects) {
    const list = byDeveloper.get(project.developerId) ?? [];
    list.push(project);
    byDeveloper.set(project.developerId, list);
  }

  const recommendations: ContractorRecommendation[] = [];

  for (const [developerId, developerProjects] of byDeveloper) {
    const developerName = developerProjects[0]?.developerName ?? "Unknown";
    const totalProjects = developerProjects.length;

    const matchedProjects = developerProjects.filter((project) => {
      if (project.type !== targetType) return false;
      if (targetDistrict && project.district !== targetDistrict) return false;
      return true;
    });

    const matchedCompleted = matchedProjects.filter((project) => project.status === "completed").length;
    const matchedInProgress = matchedProjects.filter((project) => project.status === "in progress").length;
    const matchedPlanned = matchedProjects.filter((project) => project.status === "planned").length;
    const completedTotal = developerProjects.filter((project) => project.status === "completed").length;

    let totalComplaints = 0;
    let matchedComplaints = 0;
    for (const project of developerProjects) {
      const count = complaintsByProject.get(project.id) ?? 0;
      totalComplaints += count;
      if (project.type === targetType) {
        matchedComplaints += count;
      }
    }

    const complaintRate = totalProjects === 0 ? 0 : totalComplaints / totalProjects;

    // Score prioritizes relevant experience and successful completions,
    // then penalizes complaint load to avoid risky contractors.
    let score = 25;
    score += matchedCompleted * 20;
    score += matchedInProgress * 9;
    score += matchedPlanned * 4;
    score += completedTotal * 3;
    score -= complaintRate * 22;
    score -= matchedComplaints * 6;

    const reasons: string[] = [];
    if (matchedCompleted > 0) {
      reasons.push(`завершено похожих проектов: ${matchedCompleted}`);
    } else if (matchedProjects.length > 0) {
      reasons.push("есть релевантные проекты, но без завершенных кейсов");
    } else {
      reasons.push("релевантного опыта по текущему типу проекта почти нет");
    }

    if (complaintRate <= 0.5) {
      reasons.push("низкая плотность жалоб по прошлым проектам");
    } else if (complaintRate <= 1.5) {
      reasons.push("умеренный уровень жалоб, нужен дополнительный контроль");
    } else {
      reasons.push("высокая плотность жалоб, повышенный риск");
    }

    recommendations.push({
      developerId,
      developerName,
      score: Math.max(1, Math.min(100, Math.round(score))),
      matchedCompleted,
      matchedTotal: matchedProjects.length,
      totalProjects,
      totalComplaints,
      complaintRate: Number(complaintRate.toFixed(2)),
      reasons,
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

function getDistrictResidentialPressure(projects: Project[]): Record<District, number> {
  const pressure: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };

  for (const project of projects) {
    let add = 0;
    if (project.type === "residential" && project.status === "planned") add = 0.9;
    if (project.type === "residential" && project.status === "in progress") add = 1.2;
    if (project.type === "commercial" && project.status !== "completed") add = 0.5;
    pressure[project.district] += add;
  }

  return pressure;
}

function buildLegalChecks(plot: HousingPlotCandidate): LegalCheckResult[] {
  return [
    {
      code: "master-plan",
      label: "Соответствие генплану / ПДП",
      passed: plot.withinMasterPlan,
      critical: true,
    },
    {
      code: "land-use",
      label: "Разрешенное назначение земли для жилья",
      passed: plot.landUse !== "industrial",
      critical: true,
    },
    {
      code: "ownership",
      label: "Отсутствие споров по праву собственности",
      passed: !plot.hasOwnershipDispute,
      critical: true,
    },
    {
      code: "protected-zone",
      label: "Нет пересечения с охранной зоной",
      passed: !plot.hasProtectedZone,
      critical: true,
    },
    {
      code: "red-line",
      label: "Нет конфликта с красными линиями",
      passed: !plot.hasRedLineConflict,
      critical: true,
    },
    {
      code: "sanitary",
      label: "Соблюдение санитарных ограничений",
      passed: !plot.hasSanitaryConflict,
      critical: true,
    },
  ];
}

function estimateCapacityUnits(plot: HousingPlotCandidate): number {
  const density = plot.landUse === "residential" ? 85 : 110;
  return Math.round(plot.areaHa * density);
}

export function optimizeHousingLayout(
  projects: Project[],
  options: {
    targetUnits: number;
    preferredDistrict?: District;
  },
): HousingPlanResult {
  const safeTarget = Math.max(100, Math.min(20000, Math.round(options.targetUnits || 0)));
  const districtPressure = getDistrictResidentialPressure(projects);

  const recommendations = HOUSING_PLOT_CANDIDATES.map((plot) => {
    const legalChecks = buildLegalChecks(plot);
    const legalPassed = legalChecks.every((check) => !check.critical || check.passed);
    const capacityUnits = estimateCapacityUnits(plot);

    const schoolAccess = Math.max(0, 1 - plot.distanceToSchoolKm / 3);
    const transitAccess = Math.max(0, 1 - plot.distanceToTransitKm / 3);
    const infraAccessScore = schoolAccess * 20 + transitAccess * 16;

    const riskPenalty =
      plot.trafficRisk * 22 +
      plot.utilityLoad * 18 +
      plot.seismicRisk * 15 +
      districtPressure[plot.district] * 4;

    const districtBonus =
      options.preferredDistrict && options.preferredDistrict === plot.district ? 9 : 0;

    const legalPenalty = legalPassed ? 0 : 65;
    const scoreRaw = 42 + infraAccessScore + districtBonus - riskPenalty - legalPenalty;
    const score = Math.max(1, Math.min(100, Math.round(scoreRaw)));

    const reasons: string[] = [];
    if (legalPassed) {
      reasons.push("юр-фильтр пройден");
    } else {
      reasons.push("юр-фильтр не пройден: участок нельзя рекомендовать");
    }

    if (plot.distanceToSchoolKm <= 1.2) {
      reasons.push("хорошая близость к школам");
    }
    if (plot.distanceToTransitKm <= 1) {
      reasons.push("сильная транспортная доступность");
    }
    if (districtPressure[plot.district] >= 2) {
      reasons.push("в районе уже есть значимая строительная нагрузка");
    }

    const combinedRisk = (plot.trafficRisk + plot.utilityLoad + plot.seismicRisk) / 3;
    const riskLevel = combinedRisk <= 0.4 ? "low" : combinedRisk <= 0.6 ? "medium" : "high";

    return {
      plotId: plot.id,
      plotName: plot.name,
      district: plot.district,
      capacityUnits,
      legalPassed,
      legalChecks,
      score,
      riskLevel,
      reasons,
    } satisfies HousingPlotRecommendation;
  }).sort((a, b) => b.score - a.score);

  const selectedPlan: SelectedHousingPlot[] = [];
  let remaining = safeTarget;
  const districtChosenCount: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };

  const feasible = recommendations.filter((item) => item.legalPassed);
  const sortedForSelection = [...feasible].sort((a, b) => {
    const aPenalty = districtChosenCount[a.district] * 3;
    const bPenalty = districtChosenCount[b.district] * 3;
    return b.score - bPenalty - (a.score - aPenalty);
  });

  for (const candidate of sortedForSelection) {
    if (remaining <= 0) break;
    const plannedUnits = Math.min(candidate.capacityUnits, remaining);
    selectedPlan.push({
      plotId: candidate.plotId,
      plotName: candidate.plotName,
      district: candidate.district,
      plannedUnits,
      score: candidate.score,
    });
    districtChosenCount[candidate.district] += 1;
    remaining -= plannedUnits;
  }

  const totalPlannedUnits = safeTarget - Math.max(0, remaining);
  const legalRejectedCount = recommendations.length - feasible.length;

  const insights: string[] = [];
  if (legalRejectedCount > 0) {
    insights.push(`Отклонено участков по юр-критериям: ${legalRejectedCount}`);
  }
  if (remaining > 0) {
    insights.push(`Дефицит мощности: не хватает ${remaining} единиц жилья до целевого сценария`);
  } else {
    insights.push("Целевой объем жилья покрыт текущим набором рекомендованных участков");
  }

  const topDistrict = Object.entries(
    selectedPlan.reduce(
      (acc, item) => {
        acc[item.district] = (acc[item.district] ?? 0) + item.plannedUnits;
        return acc;
      },
      {} as Partial<Record<District, number>>,
    ),
  ).sort((a, b) => b[1] - a[1])[0];

  if (topDistrict) {
    insights.push(`Наибольший вклад в сценарий дает ${topDistrict[0]}: ${topDistrict[1]} units`);
  }

  return {
    targetUnits: safeTarget,
    totalPlannedUnits,
    uncoveredUnits: Math.max(0, remaining),
    legalRejectedCount,
    recommendations,
    selectedPlan,
    insights,
  };
}

function nearestDistrictDistanceBySupply(
  district: District,
  supply: Record<District, number>,
): number {
  let best = Number.POSITIVE_INFINITY;
  for (const candidate of DISTRICT_VALUES) {
    if (supply[candidate] <= 0) continue;
    best = Math.min(best, DISTRICT_DISTANCE_KM[district][candidate]);
  }
  return Number.isFinite(best) ? best : 4.5;
}

export function recommendUrbanProjectPlacement(
  projects: Project[],
  targetType: ProjectType,
  options?: { strictZoning?: boolean },
): UrbanPlacementPlan {
  const strictZoning = options?.strictZoning ?? true;
  const stats = getDistrictStats(projects);

  const residentialDemand: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };

  const schoolSupply: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };

  const commercialSupply: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };

  for (const district of DISTRICT_VALUES) {
    const districtStats = stats[district];
    residentialDemand[district] = districtStats.residentialReady * 1.3 + districtStats.residentialPlanned * 1.7;
    schoolSupply[district] = districtStats.schoolsReady + districtStats.schoolsPlanned * 0.6;
  }

  for (const project of projects) {
    if (project.type !== "commercial") continue;
    if (project.status === "completed") commercialSupply[project.district] += 1;
    if (project.status === "in progress") commercialSupply[project.district] += 0.8;
    if (project.status === "planned") commercialSupply[project.district] += 0.5;
  }

  const unmetSchoolNeed: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };
  for (const district of DISTRICT_VALUES) {
    unmetSchoolNeed[district] = Math.max(0, residentialDemand[district] - schoolSupply[district]);
  }

  const maxNeed = Math.max(1, ...DISTRICT_VALUES.map((district) => unmetSchoolNeed[district]));

  const unmetCommercialNeed: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };
  for (const district of DISTRICT_VALUES) {
    unmetCommercialNeed[district] = Math.max(0, residentialDemand[district] - commercialSupply[district] * 1.2);
  }
  const maxCommercialNeed = Math.max(1, ...DISTRICT_VALUES.map((district) => unmetCommercialNeed[district]));

  const residentialDeficit: Record<District, number> = {
    "Green District": 0,
    "Growing District": 0,
    "Golden District": 0,
    "Gate District": 0,
  };
  for (const district of DISTRICT_VALUES) {
    residentialDeficit[district] = Math.max(0, commercialSupply[district] * 1.1 - stats[district].residentialReady);
  }
  const maxResidentialDeficit = Math.max(1, ...DISTRICT_VALUES.map((district) => residentialDeficit[district]));

  const ranking = DISTRICT_VALUES.map((district) => {
    const zoningFit = DISTRICT_ZONING_FIT[district][targetType];
    const localNeed =
      targetType === "school"
        ? unmetSchoolNeed[district] / maxNeed
        : targetType === "commercial"
          ? unmetCommercialNeed[district] / maxCommercialNeed
          : residentialDeficit[district] / maxResidentialDeficit;

    let mobilityImpact = 0;
    let estimatedTrips = 0;
    let estimatedCo2Kg = 0;
    if (targetType === "school") {
      const currentDistance = nearestDistrictDistanceBySupply(district, schoolSupply);
      const withLocalSchoolDistance = Math.min(currentDistance, 0.7);
      const expectedTrips = unmetSchoolNeed[district] * 220;
      const kmSaved = Math.max(0, currentDistance - withLocalSchoolDistance);
      mobilityImpact = Math.min(1, (expectedTrips * kmSaved) / 3500);
      estimatedTrips = Math.round(expectedTrips);
      estimatedCo2Kg = Number((expectedTrips * kmSaved * 0.18).toFixed(1));
    } else if (targetType === "residential") {
      const currentDistance = nearestDistrictDistanceBySupply(district, commercialSupply);
      const withLocalMixDistance = Math.min(currentDistance, 1);
      const expectedTrips = Math.max(0, residentialDeficit[district]) * 170;
      const kmSaved = Math.max(0, currentDistance - withLocalMixDistance);
      mobilityImpact = Math.min(1, (expectedTrips * kmSaved) / 2800);
      estimatedTrips = Math.round(expectedTrips);
      estimatedCo2Kg = Number((expectedTrips * kmSaved * 0.18).toFixed(1));
    } else {
      const currentDistance = nearestDistrictDistanceBySupply(district, commercialSupply);
      const withLocalServiceDistance = Math.min(currentDistance, 0.9);
      const expectedTrips = residentialDemand[district] * 180;
      const kmSaved = Math.max(0, currentDistance - withLocalServiceDistance);
      mobilityImpact = Math.min(1, (expectedTrips * kmSaved) / 3200);
      estimatedTrips = Math.round(expectedTrips);
      estimatedCo2Kg = Number((expectedTrips * kmSaved * 0.18).toFixed(1));
    }

    const zoningPenalty = strictZoning && zoningFit < 0.35 ? 22 : 0;
    let score = 30 + zoningFit * 38 + localNeed * 24 + mobilityImpact * 20 - zoningPenalty;
    score = Math.max(1, Math.min(100, Math.round(score)));

    const reasons: string[] = [];
    reasons.push(`зонирование: ${(zoningFit * 100).toFixed(0)}% соответствия`);
    if (targetType === "school") {
      reasons.push(`локальный дефицит школьной инфраструктуры: ${unmetSchoolNeed[district].toFixed(1)}`);
      if (mobilityImpact >= 0.45) {
        reasons.push("строительство здесь заметно снижает межрайонные поездки утром");
      }
      if (district === "Golden District" && zoningFit < 0.35) {
        reasons.push("район бизнес-профиля: допустим компактный школьный формат или объект на стыке с соседним районом");
      }
    }
    if (strictZoning && zoningPenalty > 0) {
      reasons.push("применен штраф за нарушение функционального профиля района");
    }

    if (targetType !== "school") {
      if (targetType === "commercial" && localNeed >= 0.35) {
        reasons.push("в районе есть дефицит коммерческой инфраструктуры рядом с жильем");
      }
      if (targetType === "residential" && localNeed >= 0.35) {
        reasons.push("району нужен жилой баланс рядом с текущей экономической активностью");
      }
      if (mobilityImpact >= 0.35) {
        reasons.push("ожидается заметное снижение маятниковых поездок");
      }
    }

    return {
      district,
      score,
      zoningFit: Number(zoningFit.toFixed(2)),
      localNeed: Number(localNeed.toFixed(2)),
      mobilityImpact: Number(mobilityImpact.toFixed(2)),
      estimatedDailyTripReduction: Math.max(0, estimatedTrips),
      estimatedDailyCo2ReductionKg: Math.max(0, estimatedCo2Kg),
      reasons,
    } satisfies UrbanDistrictPlacement;
  }).sort((a, b) => b.score - a.score);

  const top = ranking[0] ?? null;

  const estimatedDailyTripReduction = top?.estimatedDailyTripReduction ?? 0;
  const estimatedDailyCo2ReductionKg = top?.estimatedDailyCo2ReductionKg ?? 0;

  return {
    targetType,
    strictZoning,
    ranking,
    recommendedDistrict: top?.district ?? null,
    estimatedDailyTripReduction,
    estimatedDailyCo2ReductionKg,
  };
}
