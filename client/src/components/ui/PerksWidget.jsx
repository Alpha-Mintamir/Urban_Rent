import React from 'react';

const PerksWidget = ({ perks }) => {
  return (
    <div className="mt-4">
      <hr className="mb-5 border" />
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {perks?.includes('parking') && (
          <div className="flex items-center gap-2 rounded-2xl border p-4">
            <span>መኪና ፓርኪንግ ቦታ</span>
          </div>
        )}
        {/* Add any other perks you want to display */}
      </div>
    </div>
  );
};

export default PerksWidget;
