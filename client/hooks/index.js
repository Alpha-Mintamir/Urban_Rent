import { useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';

import { UserContext } from '@/providers/UserProvider';
import { PlaceContext } from '@/providers/PlaceProvider';

import { getItemFromLocalStorage, setItemsInLocalStorage, removeItemFromLocalStorage } from '@/utils';
import axiosInstance from '@/utils/axios';

// USER
export const useAuth = () => {
    return useContext(UserContext)
}

export const useProvideAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initializeAuth = async () => {
            const storedUser = getItemFromLocalStorage('user');
            const token = getItemFromLocalStorage('token');
            
            if (storedUser && token) {
                try {
                    // Verify token is still valid
                    const decoded = jwt_decode(token);
                    const currentTime = Date.now() / 1000;
                    
                    if (decoded.exp < currentTime) {
                        // Token expired
                        removeItemFromLocalStorage('user');
                        removeItemFromLocalStorage('token');
                        setUser(null);
                    } else {
                        // Token valid, set user
                        const parsedUser = JSON.parse(storedUser);
                        if (parsedUser.role) {
                            parsedUser.role = parseInt(parsedUser.role);
                        }
                        setUser(parsedUser);
                        // Set token in axios defaults
                        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    }
                } catch (error) {
                    // Invalid token
                    removeItemFromLocalStorage('user');
                    removeItemFromLocalStorage('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [])

    const register = async (formData) => {
        try {
            const { data } = await axiosInstance.post('/users/register', formData);
            if (data.user && data.token) {
                setUser(data.user);
                setItemsInLocalStorage('user', data.user);
                setItemsInLocalStorage('token', data.token);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            return { success: true, message: 'Registration successful' };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed. Please try again.' 
            };
        }
    }

    const login = async (formData) => {
        try {
            const { data } = await axiosInstance.post('/users/login', formData);
            if (data.user && data.token) {
                if (data.user.role) {
                    data.user.role = parseInt(data.user.role);
                }
                setUser(data.user);
                setItemsInLocalStorage('user', data.user);
                setItemsInLocalStorage('token', data.token);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            return { success: true, message: 'Login successful' };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    }

    const googleLogin = async (credential) => {
        const decoded = jwt_decode(credential);
        try {
            const { data } = await axiosInstance.post('/users/google/login', {
                name: `${decoded.given_name} ${decoded.family_name}`,
                email: decoded.email
            });
            if (data.user && data.token) {
                if (data.user.role) {
                    data.user.role = parseInt(data.user.role);
                }
                setUser(data.user);
                setItemsInLocalStorage('user', data.user);
                setItemsInLocalStorage('token', data.token);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            return { success: true, message: 'Login successful' };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    }

    const logout = async () => {
        try {
            await axiosInstance.get('/users/logout');
            setUser(null);
            removeItemFromLocalStorage('user');
            removeItemFromLocalStorage('token');
            delete axiosInstance.defaults.headers.common['Authorization'];
            return { success: true, message: 'Logout successful' };
        } catch (error) {
            return { success: false, message: 'Something went wrong!' };
        }
    }

    const uploadPicture = async (picture) => {
        try {
            console.log('Uploading picture:', picture.name, picture.type, picture.size);
            const formData = new FormData()
            formData.append('picture', picture)
            
            const { data } = await axiosInstance.post('/users/upload-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            console.log('Upload response:', data);
            return data
        } catch (error) {
            console.error('Error uploading picture:', error.response?.data || error.message);
            throw error;
        }
    }

    const updateUser = async (userDetails) => {
        const { name, password, picture } = userDetails;
        const email = JSON.parse(getItemFromLocalStorage('user')).email
        try {
            console.log('Sending update request with picture:', picture ? 'Picture URL exists' : 'No picture');
            const { data } = await axiosInstance.put('/users/update-user', {
                name, password, email, picture
            })
            
            if (data.success && data.user) {
                console.log('User data from server:', data.user);
                // Update user in localStorage - stringify and parse to ensure deep copy
                const updatedUser = JSON.parse(JSON.stringify(data.user));
                setItemsInLocalStorage('user', updatedUser);
                
                // Force a refresh of the user data by fetching the profile
                try {
                    const profileResponse = await axiosInstance.get('/users/profile');
                    if (profileResponse.data.success && profileResponse.data.user) {
                        console.log('Profile data from server:', profileResponse.data.user);
                        // Update localStorage with the latest user data
                        setItemsInLocalStorage('user', profileResponse.data.user);
                    }
                } catch (profileError) {
                    console.error('Error fetching updated profile:', profileError);
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error updating user:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile'
            };
        }
    }


    return {
        user,
        setUser,
        register,
        login,
        googleLogin,
        logout,
        loading,
        uploadPicture,
        updateUser
    }
}


// PLACES
export const usePlaces = () => {
    return useContext(PlaceContext)
}

export const useProvidePlaces = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    const getPlaces = async () => {
        const { data } = await axiosInstance.get('/places');
        setPlaces(data.places);
        setLoading(false);
    };

    useEffect(() => {
        getPlaces();
    }, [])

    return {
        places,
        setPlaces,
        loading,
        setLoading
    }
}