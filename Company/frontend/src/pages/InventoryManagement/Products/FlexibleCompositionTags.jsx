const FlexibleCompositionTags = ({ composition }) => {
  // Defensive check: Ensure it exists and is an array with items
  if (!composition || !Array.isArray(composition) || composition.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {composition.map((chem, idx) => {
        // Skip rendering if the name or value is completely empty
        if (!chem.name && !chem.value) return null;

        return (
          <div 
            key={idx} 
            className="flex flex-col rounded-md bg-gray-50 border border-gray-200 px-2.5 py-1"
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              {chem.name || "Unknown"}
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {chem.value}
              {/* Only show formulation if it exists */}
              {chem.formulation && (
                <span className="text-gray-400 font-normal ml-1">
                  ({chem.formulation})
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default FlexibleCompositionTags; 