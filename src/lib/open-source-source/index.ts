import type { ProjectSource } from '../projects-source';
import onefile from './data/onefile.json';
import oneip from './data/oneip.json';
import onemail from './data/onemail.json';
import oneui from './data/oneui.json';

export const OPEN_SOURCE_SOURCES = [
  onefile,
  onemail,
  oneip,
  oneui,
] satisfies ProjectSource[];
