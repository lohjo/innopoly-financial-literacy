import type { ScenarioSpec } from "../../features/video-coach/types";
import { friendExpensiveWeekend } from "./friend-expensive-weekend";
import { creditCardBooth } from "./credit-card-booth";
import { offerClarification } from "./offer-clarification";

export const SCENARIOS: ScenarioSpec[] = [friendExpensiveWeekend, creditCardBooth, offerClarification];

export const scenarioById = (id: string): ScenarioSpec | undefined => SCENARIOS.find((s) => s.id === id);
