import { createContext, useContext, useEffect, type ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    favorites: 'Favorites',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    addProperty: 'Add Property',
    adminPanel: 'Admin Panel',
    activeListings: 'active listings nationwide',
    heroTitle: 'Find Your Perfect Home, Smarter.',
    heroSubtitle: 'Search millions of listings with intelligent filters, instant alerts, and verified agents — all in one place.',
    buy: 'Buy',
    rent: 'Rent',
    searchLocation: 'City, neighborhood, or ZIP code',
    searchHomes: 'Search Homes',
    activeListingsCount: 'Active Listings',
    citiesCovered: 'Cities Covered',
    happyBuyers: 'Happy Buyers',
    agentPartners: 'Agent Partners',
    handPicked: 'Hand-Picked',
    featuredProperties: 'Featured Properties',
    viewAllListings: 'View all listings',
    beds: 'beds',
    baths: 'baths',
    sqft: 'sqft',
    viewDetails: 'View Details',
    whyChooseUs: 'Why UrbanNest',
    featuresTitle: 'Everything you need to find home',
    signInTo: 'Sign in to UrbanNest',
    dontHaveAccount: "Don't have an account?",
    createOneFree: 'Create one free',
    orContinueWith: 'or continue with email',
    emailAddress: 'Email address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me for 30 days',
    termsAndPrivacy: 'By signing in, you agree to our',
    terms: 'Terms',
    and: 'and',
    privacyPolicy: 'Privacy Policy.',
    quickDemoLogin: 'Quick demo login',
    createYourAccount: 'Create your account',
    alreadyHaveOne: 'Already have one?',
    iWantToBuyRent: 'I Want To Buy/Rent',
    iWantToSellList: 'I Want To Sell/List',
    firstName: 'First name',
    lastName: 'Last name',
    confirmPassword: 'Confirm password',
    minChars: 'Min. 8 characters',
    repeatPassword: 'Repeat password',
    agreeTo: "I agree to UrbanNest's",
    termsOfService: 'Terms of Service',
    privacyPolicyLink: 'Privacy Policy.',
    createAccount: 'Create Account',
    totalPosted: 'Total Posted',
    activeListingsTab: 'Active Listings',
    pending: 'Pending',
    rejected: 'Rejected',
    myProperties: 'My Properties',
    savedFavorites: 'Saved Favorites',
    noProperties: 'No properties yet',
    addFirstProperty: 'Add Your First Property',
    noFavorites: 'No saved favorites yet',
    browseProperties: 'Browse Properties',
    listedBy: 'Listed by',
    verifiedAgent: 'Verified Agent',
    scheduleViewing: 'Schedule a Viewing',
    mortgageEstimate: 'Mortgage Estimate',
    mortgageSubtitle: '30-yr fixed at 6.8% APR, 20% down',
    perMonth: '/month',
    estimateDisclaimer: '* Estimate only. Contact a lender for exact terms.',
    shareThisProperty: 'Share this property',
    copyLink: 'Copy link',
    email: 'Email',
    save: 'Save',
    aboutThisProperty: 'About this property',
    similarProperties: 'Similar Properties',
    overview: 'Overview',
    features: 'Features',
    contact: 'Contact',
    built: 'Built',
    area: 'Area',
    parking: 'Parking',
    cars: 'cars',
    contactOwner: 'Contact Owner',
    callOwner: 'Call Owner',
    chatOnViber: 'Chat on Viber',
    signInToContact: 'Sign in to contact the owner',
    addNewProperty: 'Add New Property',
    editProperty: 'Edit Property',
    fillDetails: 'Fill in the details to list your property',
    propertyInfo: 'Property Info',
    basicDetails: 'Basic property details',
    specifications: 'Specifications',
    sizeAndLayout: 'Size and layout',
    description: 'Description',
    tellUsMore: 'Tell us more',
    media: 'Media',
    uploadPhotos: 'Upload photos',
    propertyTitle: 'Property Title',
    listingType: 'Listing Type',
    forSale: 'For Sale',
    forRent: 'For Rent',
    price: 'Price (MMK)',
    township: 'Township',
    selectLocation: 'Select location',
    sqftLabel: 'Sq Ft',
    address: 'Address',
    fullAddress: 'Full property address',
    descriptionLabel: 'Description',
    descPlaceholder: 'Describe your property in detail...',
    featuresLabel: 'Features & Amenities',
    dragDrop: 'Drag and drop your photos here',
    orClickToBrowse: 'or click to browse',
    chooseFiles: 'Choose Files',
    uploadAtLeast: 'Upload at least 1 photo. Recommended size: 1200x800px',
    previous: 'Previous',
    next: 'Next',
    submitForApproval: 'Submit for Approval',
    propertySubmitted: 'Property Submitted!',
    submittedDesc: 'Your property has been submitted for approval.',
    redirecting: 'Redirecting to dashboard...',
    adminDashboard: 'Admin Dashboard',
    totalUsers: 'Total Users',
    totalProperties: 'Total Properties',
    pendingApprovals: 'Pending Approvals',
    manageData: 'Manage Data',
    approve: 'Approve',
    reject: 'Reject',
    featuresAmenities: 'Features & Amenities',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = 'en';

  useEffect(() => {
    document.documentElement.lang = 'en';
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t, toggleLanguage: () => {} }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
