import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import propertyImage from "@/assets/property-2.jpg";
import { useAuth } from "../../hooks";
import { Search } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect logged-in users to their respective dashboards
  useEffect(() => {
    if (user) {
      const userRole = parseInt(user.role);
      console.log("Home - User Role:", userRole);
      
      // Redirect based on user role
      switch (userRole) {
        case 1: // Tenant
          navigate('/browse');
          break;
        case 2: // Property Owner
          navigate('/owner/dashboard');
          break;
        case 3: // Broker
          navigate('/broker/dashboard');
          break;
        case 4: // Admin
          navigate('/admin/dashboard');
          break;
        default:
          console.log("Unknown user role:", userRole);
      }
    }
  }, [user, navigate]);

  // If user is logged in, don't render the landing page content
  if (user) {
    return null; // Return nothing while redirecting
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent form submission if it were a form
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/browse'); // Navigate to browse page even if search is empty
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {/* Hero Section */}
      <header 
        className="relative h-[calc(100vh-80px)] min-h-[500px] max-h-[700px] bg-cover bg-center flex flex-col justify-center items-center text-white text-center p-6"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${propertyImage})` }}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Find Your <span className="text-pink-400">&lt;Perfect Rental&gt;</span> Space
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mt-6 max-w-xl mx-auto text-gray-200">
            Discover top listings, explore by neighborhood, and rent your dream space with UrbanRent.
          </p>

          {/* Search Form */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="mt-10 w-full max-w-xl mx-auto bg-white rounded-lg shadow-2xl flex items-center transition-all duration-300 focus-within:ring-2 focus-within:ring-pink-500"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by location, address, or property type..."
              className="flex-grow px-5 py-4 text-gray-700 focus:outline-none rounded-l-lg text-base md:text-lg"
            />
            <button 
              type="submit"
              className="bg-pink-500 text-white px-5 py-4 md:px-7 flex items-center justify-center rounded-r-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Search size={20} className="mr-0 md:mr-2" /> 
              <span className="hidden md:inline">Search</span>
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
            <Link to="/browse" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full bg-pink-500 text-white hover:bg-pink-600 px-8 py-3 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Explore All Rentals
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button 
                variant="outline"
                size="lg" 
                className="w-full bg-transparent text-white border-2 border-white hover:bg-white hover:text-pink-500 px-8 py-3 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
          Why Choose <span className="text-pink-500">UrbanRent</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center transform hover:-translate-y-1">
            <div className="bg-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-md">1</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Easy & Intuitive Search</h3>
            <p className="text-gray-600">Find properties that match your needs with our powerful search tools.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-[#D746B7] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">2</div>
            <h3 className="text-xl font-bold mb-3">Verified Listings</h3>
            <p className="text-gray-600">All our properties are verified to ensure you get what you see.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-[#D746B7] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">3</div>
            <h3 className="text-xl font-bold mb-3">Secure Transactions</h3>
            <p className="text-gray-600">Book and pay for properties with our secure payment system.</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-[#F9F9F9] py-16 px-6 md:px-12">
        <h2 className="text-4xl font-bold text-center mb-12">Browse by Category</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {["Apartments", "Houses", "Commercial Spaces", "Vacation Rentals"].map((category) => (
            <Button key={category} className="px-8 py-4 bg-pink-500 text-white rounded-lg text-lg hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105">
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 md:px-12 text-center bg-white">
        <h2 className="text-4xl font-bold mb-12">What Our Clients Say</h2>
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-600 italic">"UrbanRent made finding a rental so easy! The platform is intuitive, and I found my dream apartment within days. Highly recommended for anyone looking for a hassle-free rental experience."</p>
          <p className="text-lg font-semibold mt-6">- Sarah Johnson</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#D746B7] text-white py-16 px-6 md:px-12 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Find Your <span className="text-gray-800">Perfect Rental</span>?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of satisfied users who found their ideal homes with UrbanRent.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/browse">
            <Button className="bg-white text-pink-500 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-md shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
              Start Exploring
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-500 px-8 py-3 text-lg font-semibold rounded-md shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
              Sign Up
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-10 px-6 md:px-12 text-center">
        <p>&copy; {new Date().getFullYear()} UrbanRent. All rights reserved.</p>
        <p className="mt-2 text-sm text-gray-400">Your trusted partner in finding the perfect rental space.</p>
      </footer>
    </div>
  );
};

export default Home;
