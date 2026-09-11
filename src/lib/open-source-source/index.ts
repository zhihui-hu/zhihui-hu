import type { ProjectSource } from '../projects-source';
import onefile from './data/onefile.json';
import oneip from './data/oneip.json';
import onemail from './data/onemail.json';

export const OPEN_SOURCE_SOURCES = [
  onefile,
  onemail,
  oneip,
] satisfies ProjectSource[];
