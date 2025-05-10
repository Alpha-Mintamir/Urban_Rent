import React, { createContext, useState, useContext, useEffect } from 'react';

// Create language context
export const LanguageContext = createContext();

// Translations object with Amharic and English
export const translations = {
  // Common UI elements
  appName: {
    am: 'ኣርባን ሬንት',
    en: 'Urban Rent'
  },
  login: {
    am: 'ግባ',
    en: 'Login'
  },
  register: {
    am: 'ተመዝገብ',
    en: 'Register'
  },
  logout: {
    am: 'ውጣ',
    en: 'Logout'
  },
  profile: {
    am: 'የኔ ፕሮፋይል',
    en: 'My Profile'
  },
  dashboard: {
    am: 'ዳሽቦርድ',
    en: 'Dashboard'
  },
  propertyOwnerDashboard: {
    am: 'የንብረት ባለቤት ዳሽቦርድ',
    en: 'Property Owner Dashboard'
  },
  brokerDashboard: {
    am: 'የደላላ ዳሽቦርድ',
    en: 'Broker Dashboard'
  },
  settings: {
    am: 'ቅንብሮች',
    en: 'Settings'
  },
  settingsTitle: {
    am: 'ቅንብሮች',
    en: 'Settings'
  },
  myProperties: {
    am: 'የእኔ ንብረቶች',
    en: 'My Properties'
  },
  addProperty: {
    am: 'ንብረት አስገባ',
    en: 'Add Property'
  },
  save: {
    am: 'አስቀምጥ',
    en: 'Save'
  },
  cancel: {
    am: 'ሰርዝ',
    en: 'Cancel'
  },
  edit: {
    am: 'አርትዕ',
    en: 'Edit'
  },
  delete: {
    am: 'ሰርዝ',
    en: 'Delete'
  },
  rentHome: {
    am: 'ቤት አከራይ',
    en: 'Rent Home'
  },
  welcomeBack: {
    am: 'እንኳን ደህና መጡ',
    en: 'Welcome Back'
  },
  welcomeToDashboard: {
    am: 'ወደ ዳሽቦርድ እንኳን ደህና መጡ',
    en: 'Welcome to Dashboard'
  },
  returnToDashboard: {
    am: 'ወደ ዳሽቦርድ ተመለስ',
    en: 'Return to Dashboard'
  },
  recentActivity: {
    am: 'የቅርብ ጊዜ እንቅስቃሴዎች',
    en: 'Recent Activity'
  },
  quickLinks: {
    am: 'ፈጣን ማገናኛዎች',
    en: 'Quick Links'
  },
  usefulTips: {
    am: 'ጠቃሚ ምክሮች',
    en: 'Useful Tips'
  },
  myProfile: {
    am: 'የእኔ መገለጫ',
    en: 'My Profile'
  },
  bookings: {
    am: 'ቦታ ማስያዣዎች',
    en: 'Bookings'
  },
  propertySummary: {
    am: 'የንብረት መገለጫ',
    en: 'Property Summary'
  },
  showMyProperties: {
    am: 'የእኔ ንብረቶችን አሳየኝ',
    en: 'Show My Properties'
  },
  addNewProperty: {
    am: 'አዲስ ንብረት ያስገቡ',
    en: 'Add New Property'
  },
  reviews: {
    am: 'ግምገማዎች',
    en: 'Reviews'
  },
  messages: {
    am: 'መልዕክቶች',
    en: 'Messages'
  },
  noMessages: {
    am: 'ምንም መልዕክቶች የሉም',
    en: 'No Messages'
  },
  noMessagesDescription: {
    am: 'እስካሁን ምንም የመልዕክት ልውውጦች የሉም። ደንበኞች ስለ ንብረትዎ ሲጠይቁ እዚህ ይታያሉ።',
    en: 'You have no message conversations yet. They will appear here when customers inquire about your property.'
  },
  messageConversations: {
    am: 'የመልዕክት ልውውጦች',
    en: 'Message Conversations'
  },
  customer: {
    am: 'ደንበኛ',
    en: 'Customer'
  },
  sendMessage: {
    am: 'መልዕክት ይጣፉ...',
    en: 'Type a message...'
  },
  startConversation: {
    am: 'ልውውጡን ለመጀመር መልዕክት ይላ኱',
    en: 'Send a message to start the conversation'
  },
  selectConversation: {
    am: 'ልውውጥ ይምረጡ',
    en: 'Select a conversation'
  },
  noPropertiesYet: {
    am: 'እስካሁን ምንም ንብረት አላስገቡም። አዲስ ንብረት ለማስገባ "አዲስ ንብረት ያስገቡ" የሚለውን ይጡኑ።',
    en: 'You haven\'t added any properties yet. Click "Add New Property" to add a new property.'
  },
  youHaveAddedProperties: {
    am: 'እስካሁን {{count}} ንብረቶችን አስገብተዋል። ለማየት ከታች ይጥሩ።',
    en: 'You have added {{count}} properties so far. Click below to view them.'
  },
  qualityPhotos: {
    am: 'ንብረትዎን ለማስተዋወቅ ጥራት ያላቸው ፍቶዎችን ይጠቀሙ',
    en: 'Use quality photos to promote your property'
  },
  accurateDescription: {
    am: 'ትክክለኛና ዝርዝር መግለጫ ይስጡ',
    en: 'Provide accurate and detailed description'
  },
  quickResponse: {
    am: 'ለደንበኞች ጥያቄዎች በፍጥነት ምላሽ ይስጡ',
    en: 'Respond quickly to customer inquiries'
  },
  competitivePrice: {
    am: 'ዋጋዎን ከአካባቢው ገበያ ጋር ያመጣጥኑ',
    en: 'Price your property competitively'
  },
  noPropertiesFound: {
    am: 'ምንም ንብረት አልተገኘም',
    en: 'No properties found'
  },
  
  // Property related
  propertyDetails: {
    am: 'የንብረት ዝርዝር',
    en: 'Property Details'
  },
  propertyName: {
    am: 'የንብረት ስም',
    en: 'Property Name'
  },
  price: {
    am: 'ዋጋ',
    en: 'Price'
  },
  description: {
    am: 'መግለጫ',
    en: 'Description'
  },
  location: {
    am: 'አድራሻ',
    en: 'Location'
  },
  propertyType: {
    am: 'የንብረት አይነት',
    en: 'Property Type'
  },
  propertyStatus: {
    am: 'የንብረት ሁኔታ',
    en: 'Property Status'
  },
  propertySize: {
    am: 'የንብረት መጠን',
    en: 'Property Size'
  },
  bedrooms: {
    am: 'የመታ ቅፍሎች',
    en: 'Bedrooms'
  },
  bathrooms: {
    am: 'የመታጠቢያ ቅፍሎች',
    en: 'Bathrooms'
  },
  amenities: {
    am: 'አገልግሎቶች',
    en: 'Amenities'
  },
  features: {
    am: 'ተገቢዎች',
    en: 'Features'
  },
  photos: {
    am: 'ፍቶዎች',
    en: 'Photos'
  },
  uploadPhotos: {
    am: 'ፍቶዎችን አስገባ',
    en: 'Upload Photos'
  },
  addMore: {
    am: 'ተገምር አስገባ',
    en: 'Add More'
  },
  remove: {
    am: 'አስወግድ',
    en: 'Remove'
  },
  submit: {
    am: 'አስገባ',
    en: 'Submit'
  },
  confirm: {
    am: 'አርጋግጥ',
    en: 'Confirm'
  },
  
  // Location related
  subCity: {
    am: 'ክፍለ ከተማ',
    en: 'Sub City'
  },
  woreda: {
    am: 'ወረዳ',
    en: 'Woreda'
  },
  kebele: {
    am: 'ቀበለ',
    en: 'Kebele'
  },
  houseNumber: {
    am: 'የቤት ቁጥር',
    en: 'House Number'
  },
  areaName: {
    am: 'የአካባቢ ስም',
    en: 'Area Name'
  },
  locationVerification: {
    am: 'የአድራሻ ማረጋገጫ',
    en: 'Location Verification'
  },
  locationVerificationDescription: {
    am: 'የንብረትዎን አድራሻ ያረጋግጡ',
    en: 'Verify your property location'
  },
  selectSubCity: {
    am: 'ክፍለ ከተማ ይምረጡ',
    en: 'Select Sub City'
  },
  selectWoreda: {
    am: 'ወረዳ ይምረጡ',
    en: 'Select Woreda'
  },
  selectKebele: {
    am: 'ቀበለ ይምረጡ',
    en: 'Select Kebele'
  },
  enterHouseNumber: {
    am: 'የቤት ቁጥር ያስገቡ',
    en: 'Enter House Number'
  },
  enterAreaName: {
    am: 'የአካባቢ ስም ያስገቡ',
    en: 'Enter Area Name'
  },
  verifyLocation: {
    am: 'አድራሻን አረጋግጥ',
    en: 'Verify Location'
  },
  locationVerified: {
    am: 'አድራሻ ተረጋግጧል',
    en: 'Location Verified'
  },
  continueToPropertyDetails: {
    am: 'ወደ ንብረት ዝርዝር ቀጥል',
    en: 'Continue to Property Details'
  },
  
  // Theme related
  theme: {
    am: 'ገጽታ',
    en: 'Theme'
  },
  lightTheme: {
    am: 'ብሩህ',
    en: 'Light'
  },
  darkTheme: {
    am: 'ጨለማ',
    en: 'Dark'
  },
  themeSection: {
    am: 'የገጽታ ምርጫ',
    en: 'Theme Options'
  },
  themeLabel: {
    am: 'ገጽታ',
    en: 'Theme'
  },
  themePreview: {
    am: 'የገጽታ ምሳሌ',
    en: 'Theme Preview'
  },
  
  // Language related
  language: {
    am: 'ቋንቋ',
    en: 'Language'
  },
  amharic: {
    am: 'አማርኛ',
    en: 'Amharic'
  },
  english: {
    am: 'እንግሊዝኛ',
    en: 'English'
  },
  languageSection: {
    am: 'የቋንቋ ምርጫ',
    en: 'Language Options'
  },
  languageLabel: {
    am: 'ቋንቋ',
    en: 'Language'
  },
  saveButton: {
    am: 'ቅንብሮችን አስቀምጥ',
    en: 'Save Settings'
  },
  editProfile: {
    am: 'መገለጫ አርትዕ',
    en: 'Edit Profile'
  },
  name: {
    am: 'ስም',
    en: 'Name'
  },
  email: {
    am: 'ኢሜይል',
    en: 'Email'
  },
  newPassword: {
    am: 'አዲስ የመግቢያ ቃል',
    en: 'New Password'
  },
  confirmPassword: {
    am: 'የመግቢያ ቃልን ያረጋግጡ',
    en: 'Confirm Password'
  },
  saveChanges: {
    am: 'ለውጦችን አስቀምጥ',
    en: 'Save Changes'
  },
  uploadProfilePicture: {
    am: 'የመገለጫ ስዕል አስገባ',
    en: 'Upload Profile Picture'
  },
  settingsDescription: {
    am: 'የምትፈልገውን ቋንቋ እና ገጽታ ምረጥ',
    en: 'Choose your preferred language and theme'
  },
  
  // Broker specific translations
  verifiedBroker: {
    am: 'የተረጋገጠ ደላላ',
    en: 'Verified Broker'
  },
  brokerBadge: {
    am: 'የደላላ ባጅ',
    en: 'Broker Badge'
  },
  brokerBenefits: {
    am: 'የደላላ ጥቅሞች',
    en: 'Broker Benefits'
  },
  brokerVerification: {
    am: 'የደላላ ማረጋገጫ',
    en: 'Broker Verification'
  },
  propertyAnalytics: {
    am: 'የንብረት ትንተና',
    en: 'Property Analytics'
  },
  clients: {
    am: 'ደንበኞች',
    en: 'Clients'
  },
  pendingDeals: {
    am: 'በመጠባበቅ ላይ ያሉ ዕድሎች',
    en: 'Pending Deals'
  },
  enhancedAnalytics: {
    am: 'የተሻሻለ የንብረት ትንተና',
    en: 'Enhanced Property Analytics'
  },
  prioritySupport: {
    am: 'ቅድሚያ የደንበኛ ድጋፍ',
    en: 'Priority Customer Support'
  },
  myReviews: {
    am: 'የእኔ ግምገማዎች',
    en: 'My Reviews'
  },
  
  // Additional broker-specific translations
  brokerListings: {
    am: 'የደላላ ንብረቶች',
    en: 'Broker Listings'
  },
  manageBrokerListings: {
    am: 'የደላላ ንብረቶችን ያስተዳድሩ',
    en: 'Manage Broker Listings'
  },
  brokerStatistics: {
    am: 'የደላላ ስታቲስቲክስ',
    en: 'Broker Statistics'
  },
  listedProperties: {
    am: 'የተዘረዘሩ ንብረቶች',
    en: 'Listed Properties'
  },
  activeClients: {
    am: 'ንቁ ደንበኞች',
    en: 'Active Clients'
  },
  completedDeals: {
    am: 'የተጠናቀቁ ዕድሎች',
    en: 'Completed Deals'
  },
  brokerCommission: {
    am: 'የደላላ ኮሚሽን',
    en: 'Broker Commission'
  },
  clientsCount: {
    am: 'የደንበኞች ብዛት',
    en: 'Clients Count'
  },
  dealsCompleted: {
    am: 'የተጠናቀቁ ግብይቶች',
    en: 'Deals Completed'
  },
  dealsInProgress: {
    am: 'በሂደት ላይ ያሉ ግብይቶች',
    en: 'Deals In Progress'
  },
  broker: {
    am: 'ደላላ',
    en: 'Broker'
  },
  brokerTips: {
    am: 'የደላላ ምክሮች',
    en: 'Broker Tips'
  },
  marketKnowledge: {
    am: 'የገበያ እውቀት ያዳብሩ',
    en: 'Develop market knowledge'
  },
  clientRelationship: {
    am: 'ከደንበኞች ጋር ጥሩ ግንኙነት ይፍጠሩ',
    en: 'Build strong client relationships'
  },
  negotiationSkills: {
    am: 'የድርድር ክህሎትዎን ያሻሽሉ',
    en: 'Improve your negotiation skills'
  },
  propertyValuation: {
    am: 'ትክክለኛ የንብረት ግምት ይስጡ',
    en: 'Provide accurate property valuations'
  },
  legalKnowledge: {
    am: 'የሕግ ዕውቀትዎን ያዳብሩ',
    en: 'Develop your legal knowledge'
  },
  totalProperties: {
    am: 'ጠቅላላ ንብረቶች',
    en: 'Total Properties'
  },
  
  // Admin-specific translations
  adminDashboard: {
    am: 'የአስተዳዳሪ ዳሽቦርድ',
    en: 'Admin Dashboard'
  },
  adminOnly: {
    am: 'ይህ አካባቢ ለአስተዳዳሪዎች ብቻ ነው',
    en: 'This area is for admins only'
  },
  pendingVerifications: {
    am: 'በመጠባበቅ ላይ ያሉ ማረጋገጫዎች',
    en: 'Pending Verifications'
  },
  totalUsers: {
    am: 'ጠቅላላ ተጠቃሚዎች',
    en: 'Total Users'
  },
  manageVerifications: {
    am: 'ማረጋገጫዎችን ያስተዳድሩ',
    en: 'Manage Verifications'
  },
  manageUsers: {
    am: 'ተጠቃሚዎችን ያስተዳድሩ',
    en: 'Manage Users'
  },
  manageProperties: {
    am: 'ንብረቶችን ያስተዳድሩ',
    en: 'Manage Properties'
  },
  adminMenu: {
    am: 'የአስተዳዳሪ ምናሌ',
    en: 'Admin Menu'
  },
  userManagement: {
    am: 'የተጠቃሚ አስተዳደር',
    en: 'User Management'
  },
  propertyManagement: {
    am: 'የንብረት አስተዳደር',
    en: 'Property Management'
  },
  securitySettings: {
    am: 'የደህንነት ቅንብሮች',
    en: 'Security Settings'
  },
  reports: {
    am: 'ሪፖርቶች እና ትንተናዎች',
    en: 'Reports & Analytics'
  },
  quickActions: {
    am: 'ፈጣን እርምጃዎች',
    en: 'Quick Actions'
  },
  reviewBrokerVerifications: {
    am: 'የደላላ ማረጋገጫዎችን ይገምግሙ',
    en: 'Review Broker Verifications'
  },
  brokerVerificationManagement: {
    am: 'የደላላ ማረጋገጫ አስተዳደር',
    en: 'Broker Verification Management'
  },
  backToDashboard: {
    am: 'ወደ ዳሽቦርድ ተመለስ',
    en: 'Back to Dashboard'
  },
  pending: {
    am: 'በሂደት ላይ',
    en: 'Pending'
  },
  approved: {
    am: 'ተፈቅዷል',
    en: 'Approved'
  },
  rejected: {
    am: 'ተቀባይነት አላገኘም',
    en: 'Rejected'
  },
  loading: {
    am: 'በመጫን ላይ...',
    en: 'Loading...'
  },
  noPendingRequests: {
    am: 'በመጠባበቅ ላይ ያሉ ማረጋገጫ ጥያቄዎች የሉም',
    en: 'No pending verification requests'
  },
  noApprovedRequests: {
    am: 'ምንም የጸደቁ ማረጋገጫዎች የሉም',
    en: 'No approved verifications'
  },
  noRejectedRequests: {
    am: 'ምንም ውድቅ የተደረጉ ማረጋገጫዎች የሉም',
    en: 'No rejected verifications'
  },
  brokerDetails: {
    am: 'የደላላ ዝርዝሮች',
    en: 'Broker Details'
  },
  approveVerification: {
    am: 'ማረጋገጫን አጽድቅ',
    en: 'Approve Verification'
  },
  rejectVerification: {
    am: 'ማረጋገጫን ውድቅ አድርግ',
    en: 'Reject Verification'
  },
  brokerInformation: {
    am: 'የደላላ መረጃ',
    en: 'Broker Information'
  },
  documentInfo: {
    am: 'የሰነድ መረጃ',
    en: 'Document Information'
  },
  additionalInfo: {
    am: 'ተጨማሪ መረጃ',
    en: 'Additional Information'
  },
  document: {
    am: 'ሰነድ',
    en: 'Document'
  },
  viewPDF: {
    am: 'የPDF ሰነዱን ይመልከቱ',
    en: 'View PDF Document'
  },
  approveConfirmation: {
    am: 'እርግጠኛ ነዎት ይህን የደላላ ማረጋገጫ ጥያቄ ማጽደቅ ይፈልጋሉ?',
    en: 'Are you sure you want to approve this broker verification request?'
  },
  adminCancel: {
    am: 'ይቅር',
    en: 'Cancel'
  },
  approve: {
    am: 'አጽድቅ',
    en: 'Approve'
  },
  rejectionReason: {
    am: 'ውድቅ የተደረገበት ምክንያት',
    en: 'Rejection Reason'
  },
  rejectionReasonPlaceholder: {
    am: 'እባክዎ ይህን ማረጋገጫ ጥያቄ ውድቅ ለማድረግ ምክንያት ይስጡ',
    en: 'Please provide a reason for rejecting this verification request'
  },
  reject: {
    am: 'ውድቅ አድርግ',
    en: 'Reject'
  },
  noReasonProvided: {
    am: 'ምንም ምክንያት አልተሰጠም',
    en: 'No reason provided'
  },
  rejectedAt: {
    am: 'ውድቅ የተደረገበት ጊዜ',
    en: 'Rejected at'
  },
  verificationApproved: {
    am: 'የደላላ ማረጋገጫ በተሳካ ሁኔታ ጸድቋል',
    en: 'Broker verification approved successfully'
  },
  verificationRejected: {
    am: 'የደላላ ማረጋገጫ ውድቅ ተደርጓል',
    en: 'Broker verification rejected'
  },
  errorApprovingVerification: {
    am: 'ማረጋገጫን ማጽደቅ አልተሳካም',
    en: 'Failed to approve verification'
  },
  errorRejectingVerification: {
    am: 'ማረጋገጫን ውድቅ ማድረግ አልተሳካም',
    en: 'Failed to reject verification'
  },
  rejectionReasonRequired: {
    am: 'እባክዎ ውድቅ ለማድረግ ምክንያት ይስጡ',
    en: 'Please provide a reason for rejection'
  },
  errorFetchingRequests: {
    am: 'የማረጋገጫ ጥያቄዎችን መጫን አልተሳካም',
    en: 'Failed to load verification requests'
  },
  
  brokerVerificationStatus: {
    am: 'የደላላ ማረጋገጫ ሁኔታ',
    en: 'Broker Verification Status'
  },
  
  // Tenant-specific translations
  tenantDashboard: {
    am: 'የተከራይ ዳሽቦርድ',
    en: 'Tenant Dashboard'
  },
  tenant: {
    am: 'ተከራይ',
    en: 'Tenant'
  },
  savedProperties: {
    am: 'የተቀመጡ ንብረቶች',
    en: 'Saved Properties'
  },
  propertiesSaved: {
    am: 'የተቀመጡ ንብረቶች',
    en: 'Properties you saved'
  },
  activeBookings: {
    am: 'አሁን ያሉ ቦታዎች',
    en: 'Active Bookings'
  },
  currentBookings: {
    am: 'የአሁን ቦታዎች',
    en: 'Your current bookings'
  },
  viewedProperties: {
    am: 'የተመለከቱ ንብረቶች',
    en: 'Viewed Properties'
  },
  recentlyViewed: {
    am: 'በቅርቡ የተመለከቱ',
    en: 'Recently viewed'
  },
  browseProperties: {
    am: 'ንብረቶችን ይመልከቱ',
    en: 'Browse Properties'
  },
  findYourDreamHome: {
    am: 'የህልም ቤትዎን ከሰፊው ዝርዝራችን ይፈልጉ',
    en: 'Find your dream home from our extensive listings'
  },
  search: {
    am: 'ፈልግ',
    en: 'Search'
  },
  searchPlaceholder: {
    am: 'በስም፣ መግለጫ፣ ወይም አድራሻ ይፈልጉ',
    en: 'Search by name, description, or location'
  },
  minPrice: {
    am: 'ዝቅተኛ ዋጋ (ብር)',
    en: 'Min Price (ETB)'
  },
  maxPrice: {
    am: 'ከፍተኛ ዋጋ (ብር)',
    en: 'Max Price (ETB)'
  },
  propertiesFound: {
    am: 'ንብረቶች ተገኝተዋል',
    en: 'Properties Found'
  },
  newest: {
    am: 'አዲስ',
    en: 'Newest'
  },
  priceLowToHigh: {
    am: 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ',
    en: 'Price: Low to High'
  },
  priceHighToLow: {
    am: 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ',
    en: 'Price: High to Low'
  },
  tryDifferentFilters: {
    am: 'የተለያዩ ማጣሪያዎችን ወይም የፍለጋ ቃሎችን ይሞክሩ',
    en: 'Try adjusting your filters or search term to find more properties'
  },
  clearFilters: {
    am: 'ማጣሪያዎችን አጽዳ',
    en: 'Clear Filters'
  },
  backToBrowse: {
    am: 'ወደ ፍለጋ ተመለስ',
    en: 'Back to Browse'
  },
  tenantTips: {
    am: 'የተከራይ ምክሮች',
    en: 'Tenant Tips'
  },
  compareProperties: {
    am: 'ከመወሰንዎ በፊት ብዙ ንብረቶችን ያነጻጽሩ',
    en: 'Compare multiple properties before deciding'
  },
  checkAmenities: {
    am: 'ሁሉንም አገልግሎቶች እና መገልገያዎች ይፈትሹ',
    en: 'Check all amenities and facilities'
  },
  readReviews: {
    am: 'ከቀድሞ ተከራዮች ግምገማዎችን ያንብቡ',
    en: 'Read reviews from previous tenants'
  },

  negotiatePrice: {
    am: 'ዋጋውን ለመደራደር አያመንቱ',
    en: 'Don\'t hesitate to negotiate the price'
  },
  myBookings: {
    am: 'የእኔ ቦታዎች',
    en: 'My Bookings'
  },
  allUsers: {
    en: 'All Users'
  },
  searchUsers: {
    en: 'Search users...'
  },
  viewDetails: {
    en: 'View Details'
  },
  deleteUser: {
    en: 'Delete User'
  },
  userDeleted: {
    en: 'User deleted successfully'
  },
  errorDeletingUser: {
    en: 'Failed to delete user'
  },
  errorFetchingUsers: {
    en: 'Failed to load users'
  },
  noUsersFound: {
    en: 'No users found'
  },
  deleteUserConfirmation: {
    en: 'Are you sure you want to delete this user? This action cannot be undone.'
  },
  cannotDeleteAdmin: {
    en: 'Cannot delete admin users'
  },
  allProperties: {
    en: 'All Properties'
  },
  searchProperties: {
    en: 'Search properties...'
  },
  allTypes: {
    en: 'All Types'
  },
  viewProperty: {
    en: 'View Property'
  },
  deleteProperty: {
    en: 'Delete Property'
  },
  propertyDeleted: {
    en: 'Property deleted successfully'
  },
  errorDeletingProperty: {
    en: 'Failed to delete property'
  },
  errorFetchingProperties: {
    en: 'Failed to load properties'
  },
  deletePropertyConfirmation: {
    en: 'Are you sure you want to delete this property? This action cannot be undone.'
  },
  owner: {
    en: 'Owner'
  },
  unknown: {
    en: 'Unknown'
  }
};

export const LanguageProvider = ({ children }) => {
  // Default language is Amharic
  const [language, setLanguage] = useState('am');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translate function
  const t = (key) => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key]['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
