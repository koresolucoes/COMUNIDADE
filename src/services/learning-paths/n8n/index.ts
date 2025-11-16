import { n8nFundamentosPath } from './fundamentos';
import { n8nBasicoPath } from './basico';
import { n8nIntermediarioPath } from './intermediario';
import { n8nAvancadoPath } from './avancado';
import { LearningPath } from '../../learning.service';

export const n8nPaths: LearningPath[] = [
  n8nFundamentosPath,
  n8nBasicoPath,
  n8nIntermediarioPath,
  n8nAvancadoPath,
];
