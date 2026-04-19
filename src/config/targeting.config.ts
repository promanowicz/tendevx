export interface AppConfig {
  id: string;
  displayName: string;
}

export interface TrainingConfig {
  id: number;
  displayName: string;
}

// Add new apps here
export const APPS: AppConfig[] = [
  { id: 'MYAPP',  displayName: 'My Application' },
  { id: 'FITAPP', displayName: 'Fit Application' },
];

// Add new training name mappings here
export const TRAININGS: TrainingConfig[] = [
  { id: 1, displayName: 'Cycling' },
  { id: 2, displayName: 'Running' },
  { id: 3, displayName: 'Swimming' },
  { id: 4, displayName: 'Yoga' },
  { id: 5, displayName: 'Strength Training' },
];

export const getTrainingName = (id: number): string =>
  TRAININGS.find(t => t.id === id)?.displayName ?? '';
