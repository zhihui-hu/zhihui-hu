import bigv from './data/bigv.json';
import ePortfolioAdmin from './data/e-portfolio-admin.json';
import ePortfolio from './data/e-portfolio.json';
import fofProApp from './data/fof-pro-app.json';
import fofProMiniapp from './data/fof-pro-miniapp.json';
import fofProWeb from './data/fof-pro-web.json';
import doctorDoctor from './data/njh-doctor.json';
import doctorPatient from './data/njh-patient.json';
import nsdAiMiniapp from './data/nsd-ai-miniapp.json';
import openalphaAdmin from './data/openalpha-admin.json';
import openalpha from './data/openalpha.json';
import tableAuFe from './data/table-au-fe.json';
import type { ProjectSource } from './types';

export const PROJECT_SOURCES = [
  bigv,
  doctorDoctor,
  doctorPatient,
  ePortfolio,
  ePortfolioAdmin,
  fofProWeb,
  tableAuFe,
  fofProApp,
  fofProMiniapp,
  nsdAiMiniapp,
  openalpha,
  openalphaAdmin,
] satisfies ProjectSource[];

export type {
  ProjectSource,
  ProjectSourceAsset,
  ProjectSourceFamily,
  ProjectSourceResource,
  ProjectSourceScreenshot,
  ProjectSourceUrls,
} from './types';
