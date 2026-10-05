import LifecycleHeader from "../components/lifecycle/LifecycleHeader";
import ProgressTimeline from "../components/lifecycle/ProgressTimeline";
import StageAnalysisCard from "../components/lifecycle/StageAnalysisCard";
import AIPredictionCard from "../components/lifecycle/AIPredictionCard";
import EfficiencyCard from "../components/lifecycle/EfficiencyCard";
import EnvironmentCard from "../components/lifecycle/EnvironmentCard";
import BenchmarkTable from "../components/lifecycle/BenchmarkTable";

import { lifecycleData } from "../utils/data/Lifecycle.data";

const Lifecycle = () => {
  return (
    <main className="flex-1 min-h-screen bg-[#F5F7FA] px-8 py-8">
      <LifecycleHeader data={lifecycleData.header} />

      <ProgressTimeline data={lifecycleData.progress} />

      <div className="grid grid-cols-12 gap-6 mt-8">
        <StageAnalysisCard data={lifecycleData.stageAnalysis} />

        <div className="col-span-4 space-y-6">
          <AIPredictionCard data={lifecycleData.aiPrediction} />

          <EfficiencyCard data={lifecycleData.efficiency} />

          <EnvironmentCard data={lifecycleData.environment} />
        </div>
      </div>

      <BenchmarkTable data={lifecycleData.benchmarks} />
    </main>
  );
};

export default Lifecycle;