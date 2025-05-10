import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import PlaceImg from './PlaceImg';

const InfoCard = ({ place, onUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isBrokerMode = location.pathname.startsWith('/broker');
  
  const isRented = place.status === 'rented';
  const statusClass = isRented ? 'bg-amber-500' : 'bg-green-500';
  const statusText = isRented ? 'Rented Out' : 'Available';
  
  const toggleRentedStatus = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      const newStatus = isRented ? 'available' : 'rented';
      
      await axiosInstance.put('/places/update-status', {
        id: place.property_id,
        status: newStatus
      });
      
      toast.success(`Property marked as ${newStatus}`);
      
      // Update the UI if callback provided
      if (onUpdate) {
        onUpdate({
          ...place,
          status: newStatus
        });
      }
    } catch (error) {
      console.error('Error updating property status:', error);
      toast.error('Failed to update property status');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const confirmDelete = () => {
    setIsDeleting(true);
  };
  
  const cancelDelete = () => {
    setIsDeleting(false);
  };
  
  const handleDelete = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      await axiosInstance.delete(`/places/delete/${place.property_id}`);
      
      toast.success('Property deleted successfully');
      
      // Update the parent component if callback provided
      if (onUpdate) {
        onUpdate(null, place.property_id);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setIsProcessing(false);
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="my-3 rounded-2xl bg-gray-100 p-4 transition-all hover:bg-gray-200">
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to permanently delete this property? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Property'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row">
        <Link
          to={`/property/detail/${place.property_id}`}
          className="flex w-full shrink-0 bg-gray-300 sm:h-32 sm:w-32"
        >
          <PlaceImg place={place} />
        </Link>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <Link to={`/property/detail/${place.property_id}`}>
              <h2 className="text-lg md:text-xl">{place.property_name}</h2>
            </Link>
            <span className={`text-xs px-2 py-1 rounded-full text-white ${statusClass}`}>
              {statusText}
            </span>
          </div>
          
          <Link to={`/property/detail/${place.property_id}`}>
            <p className="line-clamp-3 mt-2 text-sm">{place.description}</p>
            <p className="mt-1 font-bold">ETB {place.price}/month</p>
          </Link>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={toggleRentedStatus}
              className={`rounded-md ${isRented ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} px-3 py-1 text-white`}
              disabled={isProcessing}
            >
              {isProcessing ? '...' : isRented ? 'Mark Available' : 'Mark Rented'}
            </button>
            
            <Link
              to={isBrokerMode ? `/broker/property/edit/${place.property_id}` : `/account/property/edit/${place.property_id}`}
              className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
              Edit
            </Link>
            
            <Link
              to={`/property/detail/${place.property_id}`}
              className="rounded-md bg-[#D746B7] px-3 py-1 text-white hover:bg-[#c13da3]"
            >
              View
            </Link>
            
            <button
              onClick={confirmDelete}
              className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
              disabled={isProcessing}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
