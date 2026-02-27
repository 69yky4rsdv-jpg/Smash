import SiteShell from "../(site)/Shell";
import { AgeGate } from "../(site)/AgeGate";
import { getModels } from "@/lib/data";
import { ModelsGridClient } from "./ModelsGridClient";

export default function ModelsPage() {
  const models = getModels();
  return (
    <AgeGate>
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Models</h1>
            <p className="text-sm text-neutral-300">
              Meet the stars of VelvetStream. Use search to quickly find a specific model.
            </p>
          </header>
          <ModelsGridClient models={models} />
        </div>
      </SiteShell>
    </AgeGate>
  );
}

