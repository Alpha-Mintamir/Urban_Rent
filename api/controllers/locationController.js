const Location = require('../models/Location');
const { Op } = require('sequelize');

// Comprehensive default location data for Ethiopia
const DEFAULT_SUB_CITIES = [
  'አዲስ ከተማ',
  'አቃቂ ቃሊቲ',
  'አራዳ',
  'ቦሌ',
  'ጉለሌ',
  'ኮልፌ ቀራኒዮ',
  'ልደታ',
  'ንፋስ ስልክ ላፍቶ',
  'ቂርቆስ',
  'የካ'
];

const DEFAULT_WOREDAS = {
  'አዲስ ከተማ': Array.from({ length: 14 }, (_, i) => `ወረዳ ${i + 1}`),
  'አቃቂ ቃሊቲ': Array.from({ length: 13 }, (_, i) => `ወረዳ ${i + 1}`),
  'አራዳ': Array.from({ length: 10 }, (_, i) => `ወረዳ ${i + 1}`),
  'ቦሌ': Array.from({ length: 14 }, (_, i) => `ወረዳ ${i + 1}`),
  'ጉለሌ': Array.from({ length: 10 }, (_, i) => `ወረዳ ${i + 1}`),
  'ኮልፌ ቀራኒዮ': Array.from({ length: 15 }, (_, i) => `ወረዳ ${i + 1}`),
  'ልደታ': Array.from({ length: 10 }, (_, i) => `ወረዳ ${i + 1}`),
  'ንፋስ ስልክ ላፍቶ': Array.from({ length: 13 }, (_, i) => `ወረዳ ${i + 1}`),
  'ቂርቆስ': Array.from({ length: 11 }, (_, i) => `ወረዳ ${i + 1}`),
  'የካ': Array.from({ length: 13 }, (_, i) => `ወረዳ ${i + 1}`)
};

// Create a comprehensive kebele list for each woreda in each sub-city
const DEFAULT_KEBELES = {};
Object.keys(DEFAULT_WOREDAS).forEach(subCity => {
  DEFAULT_KEBELES[subCity] = {};
  DEFAULT_WOREDAS[subCity].forEach(woreda => {
    // Different sub-cities have different kebele numbering patterns
    let kebeleCount = 20;
    if (subCity === 'አዲስ ከተማ' || subCity === 'ቦሌ' || subCity === 'ኮልፌ ቀራኒዮ') {
      kebeleCount = 24;
    } else if (subCity === 'አራዳ' || subCity === 'ጉለሌ' || subCity === 'ልደታ') {
      kebeleCount = 18;
    } else if (subCity === 'ቂርቆስ') {
      kebeleCount = 15;
    }
    DEFAULT_KEBELES[subCity][woreda] = Array.from({ length: kebeleCount }, (_, i) => `ቀበሌ ${i + 1}`);
  });
});

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const { sub_city, woreda, kebele, house_no, area_name } = req.body;

    // Validate required fields
    if (!sub_city || !woreda || !kebele) {
      return res.status(400).json({
        success: false,
        message: 'Sub-city, woreda, and kebele are required'
      });
    }

    // Create location in database
    const location = await Location.create({
      sub_city,
      woreda,
      kebele,
      house_no,
      area_name
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll();
    
    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await Location.findByPk(id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    res.status(200).json({
      success: true,
      location
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get locations by sub-city
exports.getLocationsBySubCity = async (req, res) => {
  try {
    const { sub_city } = req.params;
    
    const locations = await Location.findAll({
      where: { sub_city }
    });
    
    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations by sub-city:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get locations by woreda
exports.getLocationsByWoreda = async (req, res) => {
  try {
    const { woreda } = req.params;
    
    const locations = await Location.findAll({
      where: { woreda }
    });
    
    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations by woreda:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get unique sub-cities
exports.getSubCities = async (req, res) => {
  try {
    console.log('Fetching sub-cities');
    const subCities = await Location.findAll({
      attributes: ['sub_city'],
      group: ['sub_city']
    });
    
    // If no sub-cities found in the database or fewer than the defaults, return default ones
    if (subCities.length === 0 || subCities.length < DEFAULT_SUB_CITIES.length) {
      console.log('No sub-cities found in DB or fewer than defaults, returning defaults');
      return res.status(200).json({
        success: true,
        count: DEFAULT_SUB_CITIES.length,
        subCities: DEFAULT_SUB_CITIES
      });
    }
    
    const formattedSubCities = subCities.map(item => item.sub_city);
    console.log('Returning sub-cities:', formattedSubCities);
    
    // Check if all default sub-cities are included, if not, return defaults
    const hasAllDefaults = DEFAULT_SUB_CITIES.every(city => formattedSubCities.includes(city));
    if (!hasAllDefaults) {
      console.log('Not all default sub-cities found in DB, returning defaults');
      return res.status(200).json({
        success: true,
        count: DEFAULT_SUB_CITIES.length,
        subCities: DEFAULT_SUB_CITIES
      });
    }
    
    res.status(200).json({
      success: true,
      count: formattedSubCities.length,
      subCities: formattedSubCities
    });
  } catch (error) {
    console.error('Error fetching sub-cities:', error);
    // Return default sub-cities in case of error
    res.status(200).json({
      success: true,
      count: DEFAULT_SUB_CITIES.length,
      subCities: DEFAULT_SUB_CITIES
    });
  }
};

// Get woredas by sub-city
exports.getWoredasBySubCity = async (req, res) => {
  try {
    const { sub_city } = req.params;
    console.log(`Fetching woredas for sub-city: ${sub_city}`);
    
    // Check if the sub_city exists in our defaults
    if (!DEFAULT_WOREDAS[sub_city]) {
      return res.status(404).json({
        success: false,
        message: `Sub-city ${sub_city} not found`
      });
    }
    
    const woredas = await Location.findAll({
      attributes: ['woreda'],
      where: { sub_city },
      group: ['woreda']
    });
    
    // If no woredas found in the database or fewer than defaults, return default ones
    if (woredas.length === 0 || woredas.length < DEFAULT_WOREDAS[sub_city].length) {
      console.log(`No woredas found in DB or fewer than defaults for ${sub_city}, returning defaults`);
      return res.status(200).json({
        success: true,
        count: DEFAULT_WOREDAS[sub_city].length,
        woredas: DEFAULT_WOREDAS[sub_city]
      });
    }
    
    const formattedWoredas = woredas.map(item => item.woreda);
    console.log('Returning woredas:', formattedWoredas);
    
    // Check if all default woredas are included, if not, return defaults
    const hasAllDefaults = DEFAULT_WOREDAS[sub_city].every(woreda => 
      formattedWoredas.includes(woreda)
    );
    
    if (!hasAllDefaults) {
      console.log(`Not all default woredas found in DB for ${sub_city}, returning defaults`);
      return res.status(200).json({
        success: true,
        count: DEFAULT_WOREDAS[sub_city].length,
        woredas: DEFAULT_WOREDAS[sub_city]
      });
    }
    
    res.status(200).json({
      success: true,
      count: formattedWoredas.length,
      woredas: formattedWoredas
    });
  } catch (error) {
    console.error('Error fetching woredas:', error);
    // Return default woredas in case of error
    if (DEFAULT_WOREDAS[req.params.sub_city]) {
      res.status(200).json({
        success: true,
        count: DEFAULT_WOREDAS[req.params.sub_city].length,
        woredas: DEFAULT_WOREDAS[req.params.sub_city]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

// Get kebeles by woreda
exports.getKebelesByWoreda = async (req, res) => {
  try {
    const { sub_city, woreda } = req.params;
    console.log(`Fetching kebeles for sub-city: ${sub_city}, woreda: ${woreda}`);
    
    // Check if the sub_city and woreda exist in our defaults
    if (!DEFAULT_KEBELES[sub_city] || !DEFAULT_KEBELES[sub_city][woreda]) {
      return res.status(404).json({
        success: false,
        message: `Sub-city ${sub_city} or woreda ${woreda} not found`
      });
    }
    
    const kebeles = await Location.findAll({
      attributes: ['kebele'],
      where: { sub_city, woreda },
      group: ['kebele']
    });
    
    // If no kebeles found in the database or fewer than defaults, return default ones
    if (kebeles.length === 0 || kebeles.length < DEFAULT_KEBELES[sub_city][woreda].length) {
      console.log(`No kebeles found in DB or fewer than defaults for ${sub_city}/${woreda}, returning defaults`);
      return res.status(200).json({
        success: true,
        count: DEFAULT_KEBELES[sub_city][woreda].length,
        kebeles: DEFAULT_KEBELES[sub_city][woreda]
      });
    }
    
    const formattedKebeles = kebeles.map(item => item.kebele);
    console.log('Returning kebeles:', formattedKebeles);
    
    // Check if all default kebeles are included, if not, return defaults
    const hasAllDefaults = DEFAULT_KEBELES[sub_city][woreda].every(kebele => 
      formattedKebeles.includes(kebele)
    );
    
    if (!hasAllDefaults) {
      console.log(`Not all default kebeles found in DB for ${sub_city}/${woreda}, returning defaults`);
      return res.status(200).json({
        success: true,
        count: DEFAULT_KEBELES[sub_city][woreda].length,
        kebeles: DEFAULT_KEBELES[sub_city][woreda]
      });
    }
    
    res.status(200).json({
      success: true,
      count: formattedKebeles.length,
      kebeles: formattedKebeles
    });
  } catch (error) {
    console.error('Error fetching kebeles:', error);
    // Return default kebeles in case of error
    if (DEFAULT_KEBELES[req.params.sub_city]?.[req.params.woreda]) {
      res.status(200).json({
        success: true,
        count: DEFAULT_KEBELES[req.params.sub_city][req.params.woreda].length,
        kebeles: DEFAULT_KEBELES[req.params.sub_city][req.params.woreda]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};
