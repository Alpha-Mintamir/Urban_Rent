import React from 'react';

const DashboardCard = ({ title, value, description, icon, color, onClick }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
    >
      <div className={`w-16 h-16 ${color || 'bg-[#D746B7]'} rounded-full flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {value && <p className="text-3xl font-bold">{value}</p>}
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
};

export default DashboardCard;
