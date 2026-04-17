import { bigvProjectSource } from './items/bigv';
import { fofProAppProjectSource } from './items/fof-pro-app';
import { fofProMiniappProjectSource } from './items/fof-pro-miniapp';
import { fofProWebProjectSource } from './items/fof-pro-web';
import { doctorDoctorProjectSource } from './items/njh-doctor';
import { doctorPatientProjectSource } from './items/njh-patient';
import { openalphaProjectSource } from './items/openalpha';

export const PROJECT_SOURCES = [
  bigvProjectSource,
  doctorDoctorProjectSource,
  doctorPatientProjectSource,
  fofProWebProjectSource,
  fofProAppProjectSource,
  fofProMiniappProjectSource,
  openalphaProjectSource,
];

export type {
  ProjectSource,
  ProjectSourceAsset,
  ProjectSourceResource,
  ProjectSourceScreenshot,
  ProjectSourceUrls,
} from './types';
