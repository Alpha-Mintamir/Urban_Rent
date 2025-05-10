const Location = require('../models/Location');
const { Sequelize } = require('sequelize');

exports.getDistinctLocationValues = async (req, res) => {
  try {
    const distinctSubCities = await Location.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('sub_city')), 'sub_city'],
      ],
      order: [['sub_city', 'ASC']],
      raw: true, // Get plain objects
    });

    const distinctWoredas = await Location.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('woreda')), 'woreda'],
      ],
      order: [['woreda', 'ASC']],
      raw: true,
    });

    const distinctKebeles = await Location.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('kebele')), 'kebele'],
      ],
      order: [['kebele', 'ASC']],
      raw: true,
    });

    res.status(200).json({
      subCities: distinctSubCities.map(item => item.sub_city).filter(Boolean), // Filter out null/empty if any
      woredas: distinctWoredas.map(item => item.woreda).filter(Boolean),
      kebeles: distinctKebeles.map(item => item.kebele).filter(Boolean),
    });

  } catch (error) {
    console.error('Error fetching distinct location values:', error);
    res.status(500).json({
      message: 'Failed to fetch distinct location values',
      error: error.message,
    });
  }
}; 