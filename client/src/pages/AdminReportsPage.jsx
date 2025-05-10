import { useState, useEffect } from 'react';
import { useLanguage } from '../providers/LanguageProvider';
import { FaUsers, FaChartBar, FaArrowLeft, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const AdminReportsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for User Insights
  const [userSummary, setUserSummary] = useState({ totalUsers: 0, userRoleDistribution: [] });
  // State for Property Insights
  const [propertySummary, setPropertySummary] = useState({
    totalProperties: 0,
    propertyTypeDistribution: [],
    propertyStatusDistribution: [],
    averagePrice: 0,
    propertiesBySubCity: [],
    recentlyAddedCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setUserLoading(true);
      setPropertyLoading(true);
      setError(null);
      
      try {
        // Fetch User Summary
        const userResponse = await axiosInstance.get('/admin/reports/users-summary');
        if (userResponse.data.success) {
          setUserSummary(userResponse.data.data);
        } else {
          throw new Error(userResponse.data.message || 'Failed to fetch user summary');
        }
      } catch (err) {
        console.error('Error fetching user summary:', err);
        setError(prevError => prevError ? prevError + '\n' + (err.message || 'Could not load user insights.') : (err.message || 'Could not load user insights.'));
      } finally {
        setUserLoading(false);
      }

      try {
        // Fetch Property Summary
        const propertyResponse = await axiosInstance.get('/admin/reports/properties-summary');
        if (propertyResponse.data.success) {
          setPropertySummary(propertyResponse.data.data);
        } else {
          throw new Error(propertyResponse.data.message || 'Failed to fetch property summary');
        }
      } catch (err) {
        console.error('Error fetching property summary:', err);
        setError(prevError => prevError ? prevError + '\n' + (err.message || 'Could not load property insights.') : (err.message || 'Could not load property insights.'));
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!userLoading && !propertyLoading) {
      setLoading(false);
    }
  }, [userLoading, propertyLoading]);

  const userRoleChartData = {
    labels: userSummary.userRoleDistribution.map(item => t(item.name.toLowerCase().replace(/ /g, '_'), item.name)),
    datasets: [
      {
        label: t('numberOfUsers', 'Number of Users'),
        data: userSummary.userRoleDistribution.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('userRoleDistribution', 'User Role Distribution'),
      },
      colors: { // Enable chart.js built-in color schemes
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Ensure y-axis shows whole numbers for counts
        }
      }
    }
  };
  
  const handleDownload = (data, filename) => {
    if (!data || data.length === 0) {
        alert(t('noDataToDownload', 'No data available to download.'));
        return;
    }
    const columnNames = Object.keys(data[0]);
    const csvContent = [
        columnNames.join(','),
        ...data.map(row => 
            columnNames.map(fieldName => {
                let field = row[fieldName];
                // Escape commas and quotes in field data
                if (typeof field === 'string') {
                    field = field.replace(/"/g, '""'); // Escape double quotes
                    if (field.includes(',') || field.includes('\n') || field.includes('"')) {
                        field = `"${field}"`; // Enclose in double quotes
                    }
                }
                return field;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="mr-4 flex items-center text-blue-500 hover:text-blue-700"
        >
          <FaArrowLeft className="mr-2" />
          {t('backToDashboard', 'Back to Dashboard')}
        </button>
        <h1 className="text-3xl font-bold flex items-center">
          <FaChartBar className="mr-3 text-blue-500" /> 
          {t('applicationReports', 'Application Reports')}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">{t('error', 'Error')}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* User Insights Section */}
      <section className="mb-12 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold flex items-center">
            <FaUsers className="mr-2 text-indigo-500" /> {t('userInsights', 'User Insights')}
            </h2>
            <button 
                onClick={() => handleDownload(userSummary.userRoleDistribution, 'user_role_distribution.csv')}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
            >
                 {t('downloadCsv', 'Download CSV')}
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-indigo-50 rounded-md shadow">
            <h3 className="text-lg font-medium text-indigo-700">{t('totalUsers', 'Total Users')}</h3>
            <p className="text-3xl font-bold text-indigo-900">{userSummary.totalUsers}</p>
          </div>
        </div>
        
        {userSummary.userRoleDistribution.length > 0 ? (
            <div className="p-4 bg-gray-50 rounded-md shadow">
                <Bar options={chartOptions} data={userRoleChartData} />
            </div>
        ) : (
          <p>{t('noUserRoleData', 'No user role data available to display chart.')}</p>
        )}
      </section>

      {/* Property Insights Section */}
      <section className="mb-12 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center">
            <FaHome className="mr-2 text-teal-500" /> {t('propertyInsights', 'Property Insights')}
          </h2>
          {/* We can add a general download button for all property data later if needed */}
        </div>

        {/* KPI Cards for Property Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-teal-50 rounded-md shadow">
            <h3 className="text-lg font-medium text-teal-700">{t('totalProperties', 'Total Properties')}</h3>
            <p className="text-3xl font-bold text-teal-900">{propertySummary.totalProperties}</p>
          </div>
          <div className="p-4 bg-cyan-50 rounded-md shadow">
            <h3 className="text-lg font-medium text-cyan-700">{t('averagePropertyPrice', 'Average Property Price')}</h3>
            <p className="text-3xl font-bold text-cyan-900">{propertySummary.averagePrice ? `Birr\u00A0${Number(propertySummary.averagePrice).toLocaleString()}` : 'N/A'}</p>
          </div>
          <div className="p-4 bg-lime-50 rounded-md shadow">
            <h3 className="text-lg font-medium text-lime-700">{t('recentlyAddedProperties', 'Properties Added (Last 30 Days)')}</h3>
            <p className="text-3xl font-bold text-lime-900">{propertySummary.recentlyAddedCount}</p>
          </div>
        </div>

        {/* Chart for Property Type Distribution */}
        {propertySummary.propertyTypeDistribution && propertySummary.propertyTypeDistribution.length > 0 ? (
          <div className="p-4 bg-gray-50 rounded-md shadow mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">{t('propertyTypeDistribution', 'Property Types')}</h3>
              <button 
                onClick={() => handleDownload(propertySummary.propertyTypeDistribution, 'property_type_distribution.csv')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                 {t('downloadCsv', 'Download CSV')}
              </button>
            </div>
            <Bar 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: t('propertyTypeDistributionChartTitle', 'Property Type Distribution') }
                }
              }} 
              data={{
                labels: propertySummary.propertyTypeDistribution.map(item => item.name),
                datasets: [
                  {
                    label: t('numberOfProperties', 'Number of Properties'),
                    data: propertySummary.propertyTypeDistribution.map(item => item.count),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
        ) : (
          <p className="mb-6">{t('noPropertyTypeData', 'No property type data available to display chart.')}</p>
        )}

        {/* Chart for Property Status Distribution */}
        {propertySummary.propertyStatusDistribution && propertySummary.propertyStatusDistribution.length > 0 ? (
          <div className="p-4 bg-gray-50 rounded-md shadow mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">{t('propertyStatusDistribution', 'Property Statuses')}</h3>
               <button 
                onClick={() => handleDownload(propertySummary.propertyStatusDistribution, 'property_status_distribution.csv')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                 {t('downloadCsv', 'Download CSV')}
              </button>
            </div>
            <Bar 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: t('propertyStatusDistributionChartTitle', 'Property Status Distribution') }
                }
              }} 
              data={{
                labels: propertySummary.propertyStatusDistribution.map(item => item.name),
                datasets: [
                  {
                    label: t('numberOfProperties', 'Number of Properties'),
                    data: propertySummary.propertyStatusDistribution.map(item => item.count),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
        ) : (
          <p className="mb-6">{t('noPropertyStatusData', 'No property status data available to display chart.')}</p>
        )}

        {/* Chart for Properties by Sub-City */}
        {propertySummary.propertiesBySubCity && propertySummary.propertiesBySubCity.length > 0 ? (
          <div className="p-4 bg-gray-50 rounded-md shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">{t('propertiesBySubCity', 'Properties by Sub-City')}</h3>
               <button 
                onClick={() => handleDownload(propertySummary.propertiesBySubCity, 'properties_by_sub_city.csv')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                 {t('downloadCsv', 'Download CSV')}
              </button>
            </div>
            <Bar 
              options={{
                ...chartOptions,
                indexAxis: 'y', // Horizontal bar chart for potentially many sub-cities
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: t('propertiesBySubCityChartTitle', 'Properties by Sub-City') }
                }
              }} 
              data={{
                labels: propertySummary.propertiesBySubCity.map(item => item.name),
                datasets: [
                  {
                    label: t('numberOfProperties', 'Number of Properties'),
                    data: propertySummary.propertiesBySubCity.map(item => item.count),
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
        ) : (
          <p>{t('noPropertiesBySubCityData', 'No properties by sub-city data available to display chart.')}</p>
        )}
      </section>

      {/* Placeholder for Broker Insights */}
      {/* Placeholder for Review Insights */}

    </div>
  );
};

export default AdminReportsPage; 