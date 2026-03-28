interface AgentPerformanceProps {
  data: {
    agentId: string;
    agentName: string;
    resolvedCount: number;
    medianResolutionHours: number;
    currentAssigned: number;
  }[];
}

export function AgentPerformanceTable({ data }: AgentPerformanceProps) {
  return (
    <div className="bg-lumen-bg-tertiary border border-lumen-border-primary rounded-xl p-4">
      <h3 className="text-sm font-semibold text-lumen-text-primary mb-3">Performance par agent — temps médian</h3>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-lumen-border-secondary">
            <th className="text-left py-1.5 text-lumen-text-tertiary font-medium">Agent</th>
            <th className="text-left py-1.5 text-lumen-text-tertiary font-medium">Résolus</th>
            <th className="text-left py-1.5 text-lumen-text-tertiary font-medium">Médiane</th>
            <th className="text-left py-1.5 text-lumen-text-tertiary font-medium">En cours</th>
          </tr>
        </thead>
        <tbody>
          {data.map((agent) => (
            <tr key={agent.agentId} className="border-b border-lumen-bg-secondary">
              <td className="py-1.5 text-lumen-text-primary font-medium">{agent.agentName}</td>
              <td className="py-1.5">{agent.resolvedCount}</td>
              <td className="py-1.5">{agent.medianResolutionHours}h</td>
              <td className="py-1.5">{agent.currentAssigned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
