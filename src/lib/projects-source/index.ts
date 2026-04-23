import { bigvProjectSource } from './items/bigv';
import { ePortfolioProjectSource } from './items/e-portfolio';
import { ePortfolioAdminProjectSource } from './items/e-portfolio-admin';
import { fofProAppProjectSource } from './items/fof-pro-app';
import { fofProMiniappProjectSource } from './items/fof-pro-miniapp';
import { fofProWebProjectSource } from './items/fof-pro-web';
import { doctorDoctorProjectSource } from './items/njh-doctor';
import { doctorPatientProjectSource } from './items/njh-patient';
import { openalphaProjectSource } from './items/openalpha';
import { openalphaAdminProjectSource } from './items/openalpha-admin';

export const PROJECT_SOURCES = [
  bigvProjectSource,
  doctorDoctorProjectSource,
  doctorPatientProjectSource,
  ePortfolioProjectSource,
  ePortfolioAdminProjectSource,
  fofProWebProjectSource,
  fofProAppProjectSource,
  fofProMiniappProjectSource,
  openalphaProjectSource,
  openalphaAdminProjectSource,
];

export type {
  ProjectSource,
  ProjectSourceAsset,
  ProjectSourceResource,
  ProjectSourceScreenshot,
  ProjectSourceUrls,
} from './types';
