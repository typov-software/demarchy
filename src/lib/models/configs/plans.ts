export type PlanType = 'community' | 'corporate';

export interface PlanFeature {
  name: string;
  description: string;
  category: string;
}

export interface Plan {
  name: string;
  type: PlanType;
  inherits: PlanType[];
  features: PlanFeature[];
}

export interface PlansConfig {
  plans: Plan[];
}
