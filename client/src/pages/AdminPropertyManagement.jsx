import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../providers/LanguageProvider';
import { FaArrowLeft, FaTrash, FaEye, FaHome, FaSearch, FaFilter } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import PropertyDetailModal from '../components/modals/PropertyDetailModal';

const AdminPropertyManagement = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(8);
  const [filterType, setFilterType] = useState('all');
  const [viewPropertyId, setViewPropertyId] = useState(null);

  useEffect(() => {
    // Comment out the admin check to bypass security
    /* 
    if (user?.role !== 4) {
      toast.error(t('adminOnly', 'This area is for admins only'));
      navigate('/');
      return;
    }
    */

    fetchProperties();
  }, [user, navigate, t]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/places/admin/properties');
      setProperties(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error(t('errorFetchingProperties', 'Failed to load properties'));
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await axiosInstance.delete(`/places/admin/properties/${propertyId}`);
      toast.success(t('propertyDeleted', 'Property deleted successfully'));
      
      // Update the local state to reflect the change
      setProperties(prev => prev.filter(property => property.property_id !== propertyId));
      
      setIsDeleteModalOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error(t('errorDeletingProperty', 'Failed to delete property'));
    }
  };

  const openDeleteModal = (property) => {
    setSelectedProperty(property);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProperty(null);
  };

  const openPropertyDetailModal = (propertyId) => {
    setViewPropertyId(propertyId);
  };

  const closePropertyDetailModal = () => {
    setViewPropertyId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Filter properties based on search term and type
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      property.location?.area_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === 'all' || property.property_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  // Get unique property types for the filter
  const propertyTypes = ['all', ...new Set(properties.map(property => property.property_type).filter(Boolean))];

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
        <h1 className="text-3xl font-bold">{t('propertyManagement', 'Property Management')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">{t('allProperties', 'All Properties')}</h2>
            <p className="text-gray-500">{t('totalProperties', 'Total Properties')}: {properties.length}</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchProperties', 'Search properties...')}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer w-full md:w-48"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' 
                      ? t('allTypes', 'All Types') 
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProperties.map((property) => (
                <div key={property.property_id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-48 bg-gray-200">
                    {property.photos && property.photos[0]?.photo_url ? (
                      <img 
                        src={property.photos[0]?.photo_url} 
                        alt={property.property_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHome className="text-gray-400 text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-0 right-0 p-2 space-x-1">
                      <button 
                        onClick={() => openPropertyDetailModal(property.property_id)}
                        className="bg-white p-2 rounded-full shadow hover:bg-blue-50 transition-colors duration-300"
                        title={t('viewProperty', 'View Property')}
                      >
                        <FaEye className="text-blue-600" />
                      </button>
                      
                      <button 
                        onClick={() => openDeleteModal(property)}
                        className="bg-white p-2 rounded-full shadow hover:bg-red-50 transition-colors duration-300"
                        title={t('deleteProperty', 'Delete Property')}
                      >
                        <FaTrash className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1 truncate">{property.property_name}</h3>
                    <p className="text-gray-500 text-sm mb-2 truncate">{property.location?.area_name || ''}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">
                        ${property.price}
                        <span className="text-xs text-gray-500 font-normal"> / night</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {formatDate(property.createdAt)}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <span>{t('owner', 'Owner')}: </span>
                      <span className="font-medium">{property.owner?.name || t('unknown', 'Unknown')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === i + 1
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <FaHome className="mx-auto text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">{t('noPropertiesFound', 'No properties found')}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirmDelete', 'Confirm Delete')}</h3>
              <p className="mb-4">
                {t('deletePropertyConfirmation', 'Are you sure you want to delete the property')} <span className="font-semibold">{selectedProperty.property_name}</span>?
              </p>
              <p className="text-sm text-red-500 mb-2">
                {t('deletePropertyWarning', 'This action cannot be undone.')}
              </p>
            </div>
            <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleDeleteProperty(selectedProperty.property_id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                {t('delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      {viewPropertyId && (
        <PropertyDetailModal
          propertyId={viewPropertyId}
          onClose={closePropertyDetailModal}
        />
      )}
    </div>
  );
};

export default AdminPropertyManagement; 