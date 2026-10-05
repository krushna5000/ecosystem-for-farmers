const EnvironmentCard = ({ data }) => {
  return (
    <div className="bg-white rounded-[28px] p-6">
      <p className="uppercase text-xs tracking-[3px] font-bold mb-6">
        Environment
      </p>

      <div className="grid grid-cols-2 gap-6">
        {data.map((item, index) => (
          <div key={index}>
            <p className="text-xs text-gray-500 font-bold">
              {item.label}
            </p>

            <h3 className="text-2xl font-extrabold mt-1">
              {item.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentCard;