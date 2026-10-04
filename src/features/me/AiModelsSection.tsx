import React, { useState } from 'react';
import { Cpu, Download, Trash2, CheckCircle2, RotateCcw, HardDrive } from 'lucide-react';
import { Button } from '../../ui/Button';
import { aiServices } from '../../ai';
import { AIModelInfo } from '../../ai/types';

export const AiModelsSection: React.FC = () => {
  const modelManager = aiServices.modelManager;
  const [models, setModels] = useState<AIModelInfo[]>(() => modelManager.list());
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const refreshList = () => {
    setModels(modelManager.list());
  };

  const handleInstall = async (id: string) => {
    setInstallingId(id);
    setProgressMap((prev) => ({ ...prev, [id]: 10 }));
    try {
      await modelManager.install(id, (p) => {
        setProgressMap((prev) => ({ ...prev, [id]: p }));
      });
      refreshList();
    } finally {
      setInstallingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await modelManager.remove(id);
    refreshList();
  };

  const totalInstalledSize = models
    .filter((m) => m.isInstalled)
    .reduce((sum, m) => sum + m.sizeBytes, 0);

  return (
    <div className="space-y-6">
      {/* AI Models Overview Card */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">
                On-Device AI Models
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Local vision and natural language processing &bull; Zero server dependencies
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
              Models Storage
            </span>
            <span className="font-mono text-base font-bold text-text-primary">
              {Math.round(totalInstalledSize / 1024)} KB
            </span>
          </div>
        </div>

        {/* Storage Breakdown Bar per SPEC Section 9 */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-primary flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-text-secondary" />
              Device Storage Breakdown
            </span>
            <span className="text-text-secondary text-[11px]">Browser Quota: ~30 GB Available</span>
          </div>

          <div className="w-full h-3 rounded-full bg-surface-alt border border-border overflow-hidden flex">
            <div className="bg-primary h-full w-[2%]" title="App Code (~1.2 MB)" />
            <div className="bg-accent h-full w-[4%]" title="Garment Photos & Cutouts (~2.5 MB)" />
            <div className="bg-success h-full w-[1%]" title="AI Models (~240 KB)" />
            <div className="bg-surface-alt h-full flex-1" title="Free Browser Storage" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-secondary pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              <span>App Core (1.2 MB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              <span>Photos & Cutouts (2.5 MB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
              <span>AI Models ({Math.round(totalInstalledSize / 1024)} KB)</span>
            </div>
          </div>
        </div>

        {/* Model Cards List */}
        <div className="space-y-3 pt-2">
          {models.map((model) => {
            const isBusy = installingId === model.id;
            const progress = progressMap[model.id] || 0;

            return (
              <div
                key={model.id}
                className="p-4 rounded-control bg-surface-alt border border-border space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-text-primary">
                        {model.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface border border-border text-text-secondary">
                        v{model.version}
                      </span>
                      <span className="text-[10px] font-semibold text-text-secondary">
                        {model.sizeFormatted}
                      </span>
                      {model.isSimulated && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-warning/15 text-warning border border-warning/20">
                          Simulated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      {model.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {model.isInstalled ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-success font-semibold px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Installed
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInstall(model.id)}
                          aria-label={`Re-download ${model.name}`}
                          leftIcon={<RotateCcw className="w-3 h-3" />}
                        >
                          Re-download
                        </Button>

                        {model.id !== 'model-color-kmeans' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(model.id)}
                            className="text-danger hover:bg-danger/10"
                            aria-label={`Delete ${model.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleInstall(model.id)}
                        isLoading={isBusy}
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        {isBusy ? `Downloading ${progress}%` : 'Download Model'}
                      </Button>
                    )}
                  </div>
                </div>

                {isBusy && (
                  <div className="w-full h-1.5 rounded-full bg-surface border border-border overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
