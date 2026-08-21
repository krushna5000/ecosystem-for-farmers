const ActionColumn = ({ title, items }) => {
  return (
    <div className="bg-[#F8FAFC] rounded-[22px] p-5">
      <h4 className="text-sm font-[900] text-[#0B5D3B] uppercase mb-4">
        {title}
      </h4>

      <ul className="space-y-3">
        {items?.map((item, index) => (
          <li
            key={index}
            className="text-sm text-[#334155] leading-relaxed flex gap-2"
          >
            <span className="text-[#0B5D3B] font-bold">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ActionPlan = ({ actionPlan }) => {
  if (!actionPlan) return null;

  return (
    <div>
      <h3 className="text-sm font-[900] tracking-wide mb-5">
        FARMER ACTION PLAN
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ActionColumn title="Today" items={actionPlan.today} />
        <ActionColumn title="This Week" items={actionPlan.thisWeek} />
        <ActionColumn title="Next Season" items={actionPlan.nextSeason} />
      </div>
    </div>
  );
};

export default ActionPlan;