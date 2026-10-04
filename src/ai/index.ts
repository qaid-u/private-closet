export * from './types';
export * from './colorExtraction';
export * from './mockAdapters';

import {
  backgroundRemover,
  itemTagger,
  selfieAnalyzer,
  embedder,
  styleAssistant,
  modelManager,
} from './mockAdapters';

export const aiServices = {
  backgroundRemover,
  itemTagger,
  selfieAnalyzer,
  embedder,
  styleAssistant,
  modelManager,
};
