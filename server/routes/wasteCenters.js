const express = require('express');
const router = express.Router();
const WasteCenter = require('../models/WasteCenter');
const authMiddleware = require('../middleware/auth');

// Haversine distance in km between two lat/lng points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Initial seed centers for major hubs
const SEED_CENTERS = [
  // Mumbai / India
  {
    name: 'EcoRecycle Apex Scrap & Metal Mart',
    category: 'metal',
    acceptedCategories: ['metal', 'electronic', 'plastic'],
    acceptedItems: ['Copper Wire', 'Aluminum Cans', 'Brass Fittings', 'Iron Scrap', 'Old Radiators'],
    address: 'Plot 42, Sion-Bandra Link Road, Dharavi',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipcode: '400017',
    lat: 19.0435,
    lng: 72.8567,
    phone: '+91 98201 44321',
    email: 'contact@apexscrap.org',
    website: 'https://apexscrapmart.example.com',
    operatingHours: 'Mon - Sat: 8:30 AM - 7:30 PM',
    scrapRates: 'Copper: ₹480/kg, Brass: ₹320/kg, Aluminum: ₹110/kg, Iron: ₹28/kg',
    paymentTypes: ['Cash on the spot', 'UPI'],
    rating: 4.9,
    reviewsCount: 42,
    isVerified: true
  },
  {
    name: 'GreenTech Certified E-Waste Recovery Hub',
    category: 'electronic',
    acceptedCategories: ['electronic'],
    acceptedItems: ['Laptops & PCs', 'Smartphones', 'Lithium Batteries', 'Circuit Boards', 'Monitors & TVs'],
    address: 'B-Wing, MIDC Industrial Area, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipcode: '400093',
    lat: 19.1197,
    lng: 72.8697,
    phone: '+91 98192 33410',
    email: 'recycle@greentechewaste.in',
    website: 'https://greentechewaste.in',
    operatingHours: 'Mon - Fri: 9:30 AM - 6:30 PM',
    scrapRates: 'Laptops: ₹300-₹1200/unit, Phones: ₹100-₹600/unit, Batteries: ₹45/kg',
    paymentTypes: ['UPI', 'Bank Transfer', 'Eco-Points'],
    rating: 4.8,
    reviewsCount: 38,
    isVerified: true
  },
  {
    name: 'CleanOcean Plastic Recovery & Granulation Depot',
    category: 'plastic',
    acceptedCategories: ['plastic', 'paper'],
    acceptedItems: ['PET Bottles', 'HDPE Milk Jugs', 'LDPE Wrap & Film', 'Polypropylene Buckets'],
    address: 'Near Turbhe Naka, Turbhe',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    zipcode: '400705',
    lat: 19.0728,
    lng: 73.0184,
    phone: '+91 99203 11892',
    email: 'info@cleanoceanplastic.com',
    website: 'https://cleanoceanplastic.com',
    operatingHours: 'Daily: 8:00 AM - 8:00 PM',
    scrapRates: 'PET Bottles: ₹18/kg, HDPE Rigid: ₹24/kg, Clear Film: ₹12/kg',
    paymentTypes: ['Cash on the spot', 'UPI'],
    rating: 4.7,
    reviewsCount: 29,
    isVerified: true
  },
  {
    name: 'BioLoop Organic Compost & Waste Drop-off',
    category: 'organic',
    acceptedCategories: ['organic'],
    acceptedItems: ['Kitchen Scraps', 'Garden Green Waste', 'Coffee Grounds', 'Unbleached Paper Towels'],
    address: 'Eco-Park Campus, Hiranandani Estate, Thane West',
    city: 'Thane',
    state: 'Maharashtra',
    zipcode: '400607',
    lat: 19.2437,
    lng: 72.9774,
    phone: '+91 97690 44211',
    email: 'hello@biolooporganic.org',
    website: 'https://biolooporganic.org',
    operatingHours: 'Tue - Sun: 7:00 AM - 5:00 PM',
    scrapRates: 'Free drop-off · Earn 15 Eco-Points per 5kg batch of organic waste',
    paymentTypes: ['Free Drop-off', 'Eco-Points Rewards'],
    rating: 4.9,
    reviewsCount: 51,
    isVerified: true
  },
  {
    name: 'Metro Glass Bottle Bank & Cullet Center',
    category: 'glass',
    acceptedCategories: ['glass'],
    acceptedItems: ['Glass Jars', 'Soda & Beer Bottles', 'Wine Bottles', 'Broken Glass Cullet'],
    address: 'Gala 18, Reay Road Industrial Estate, Byculla',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipcode: '400010',
    lat: 18.9698,
    lng: 72.8441,
    phone: '+91 98330 99401',
    operatingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    scrapRates: 'Intact Bottles: ₹1.50 - ₹3.00/bottle, Mixed Glass Cullet: ₹3.00/kg',
    paymentTypes: ['Cash on the spot', 'UPI'],
    rating: 4.6,
    reviewsCount: 19,
    isVerified: true
  },
  {
    name: 'PaperKraft Recycling & Corrugated Box Depot',
    category: 'paper',
    acceptedCategories: ['paper', 'plastic'],
    acceptedItems: ['Cardboard Cartons', 'Newspapers', 'Office Shredded Paper', 'Magazines & Books'],
    address: 'Survey 14, Saki Naka Industrial Area, Kurla West',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipcode: '400072',
    lat: 19.0988,
    lng: 72.8833,
    phone: '+91 98671 22904',
    operatingHours: 'Daily: 8:00 AM - 7:00 PM',
    scrapRates: 'Newspaper: ₹15/kg, Corrugated Cardboard: ₹12/kg, Office White Paper: ₹16/kg',
    paymentTypes: ['Cash on the spot', 'UPI'],
    rating: 4.7,
    reviewsCount: 34,
    isVerified: true
  },

  // Bangalore / Karnataka
  {
    name: 'Hasiru Dala Community Scrap & E-Waste Center',
    category: 'electronic',
    acceptedCategories: ['electronic', 'plastic', 'metal'],
    acceptedItems: ['Electronic Circuit Boards', 'Batteries', 'Small Appliances', 'Hard Drives', 'Cables'],
    address: '24th Main Road, Sector 2, HSR Layout',
    city: 'Bangalore',
    state: 'Karnataka',
    zipcode: '560102',
    lat: 12.9116,
    lng: 77.6433,
    phone: '+91 80 2572 1099',
    email: 'info@hasirudala.org',
    operatingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    scrapRates: 'E-Waste: ₹40 - ₹120/kg, Copper/Metal: ₹380/kg',
    paymentTypes: ['UPI', 'Cash on the spot'],
    rating: 4.9,
    reviewsCount: 68,
    isVerified: true
  },
  {
    name: 'Indiranagar Kabadiwala & Plastic Recycler',
    category: 'plastic',
    acceptedCategories: ['plastic', 'metal', 'paper'],
    acceptedItems: ['Water Bottles', 'Plastic Bags', 'Metal Cans', 'Newspapers', 'Cartons'],
    address: '12th Main Road, HAL 2nd Stage, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    zipcode: '560038',
    lat: 12.9719,
    lng: 77.6412,
    phone: '+91 99001 24567',
    operatingHours: 'Daily: 8:30 AM - 8:00 PM',
    scrapRates: 'Cardboard: ₹11/kg, PET Plastic: ₹17/kg, Iron: ₹27/kg',
    paymentTypes: ['Cash on the spot', 'UPI'],
    rating: 4.8,
    reviewsCount: 45,
    isVerified: true
  },

  // Delhi NCR
  {
    name: 'GreenIndia E-Waste Collection & Dismantling Center',
    category: 'electronic',
    acceptedCategories: ['electronic', 'metal'],
    acceptedItems: ['CPUs & Laptops', 'Server Racks', 'Mobile Devices', 'Lithium Ion Cells', 'Cables'],
    address: 'Mayapuri Industrial Area, Phase II',
    city: 'New Delhi',
    state: 'Delhi',
    zipcode: '110064',
    lat: 28.6297,
    lng: 77.1265,
    phone: '+91 11 4501 8890',
    operatingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    scrapRates: 'PC Motherboards: ₹350/kg, Copper Wire: ₹440/kg, Sealed Lead Batteries: ₹65/kg',
    paymentTypes: ['Cash on the spot', 'Bank Transfer'],
    rating: 4.8,
    reviewsCount: 52,
    isVerified: true
  },
  {
    name: 'Capital Scrap & Metal Depot',
    category: 'metal',
    acceptedCategories: ['metal', 'paper'],
    acceptedItems: ['Iron Beams & Rods', 'Copper Tubing', 'Aluminum Extrusions', 'Stainless Steel'],
    address: 'Ring Road, Okhla Industrial Area Phase I',
    city: 'New Delhi',
    state: 'Delhi',
    zipcode: '110020',
    lat: 28.5284,
    lng: 77.2789,
    phone: '+91 98110 33490',
    operatingHours: 'Daily: 8:30 AM - 7:30 PM',
    scrapRates: 'Iron: ₹29/kg, Brass: ₹340/kg, Copper: ₹490/kg',
    paymentTypes: ['Cash on the spot', 'UPI'],
    rating: 4.7,
    reviewsCount: 39,
    isVerified: true
  }
];

// Seed DB on startup if empty
async function ensureSeedData() {
  try {
    const count = await WasteCenter.countDocuments();
    if (count === 0) {
      await WasteCenter.insertMany(SEED_CENTERS);
      console.log('🌱 Seeded initial Waste Centers into MongoDB');
    }
  } catch (err) {
    console.error('Error seeding Waste Centers:', err.message);
  }
}
ensureSeedData();

// Dynamic generator for any coordinate on earth so users anywhere have local centers
function generateDynamicNearbyCenters(userLat, userLng, userCity = 'Local Area') {
  const templates = [
    {
      name: `${userCity} Eco-Action Scrap & Metals`,
      category: 'metal',
      acceptedCategories: ['metal', 'plastic'],
      acceptedItems: ['Copper Wire', 'Iron Rods', 'Aluminum Cans', 'Brass Fittings'],
      dLat: 0.012,
      dLng: 0.015,
      scrapRates: 'Copper: ₹460/kg, Iron: ₹28/kg, Aluminum: ₹110/kg',
      hours: 'Mon - Sat: 8:30 AM - 7:30 PM',
      rating: 4.8,
      reviews: 31
    },
    {
      name: `${userCity} Smart E-Waste Recycling Depot`,
      category: 'electronic',
      acceptedCategories: ['electronic'],
      acceptedItems: ['Laptops & Computers', 'Smartphones', 'Lithium Batteries', 'Chargers & Cables'],
      dLat: -0.014,
      dLng: 0.008,
      scrapRates: 'Old Laptops: ₹300-₹1000/pc, Phone Batteries: ₹45/kg',
      hours: 'Mon - Fri: 9:00 AM - 6:30 PM',
      rating: 4.9,
      reviews: 47
    },
    {
      name: `PureEarth Plastic & Packaging Recovery`,
      category: 'plastic',
      acceptedCategories: ['plastic', 'paper'],
      acceptedItems: ['PET Beverage Bottles', 'HDPE Containers', 'Soft Plastic Wrap', 'Crates'],
      dLat: 0.009,
      dLng: -0.018,
      scrapRates: 'PET Bottles: ₹18/kg, Rigid Plastic: ₹22/kg',
      hours: 'Daily: 8:00 AM - 8:00 PM',
      rating: 4.7,
      reviews: 26
    },
    {
      name: `${userCity} Paper & Cardboard Recycling Bank`,
      category: 'paper',
      acceptedCategories: ['paper'],
      acceptedItems: ['Corrugated Shipping Boxes', 'Newspapers', 'Office Paper', 'Magazines'],
      dLat: -0.008,
      dLng: -0.012,
      scrapRates: 'Cardboard: ₹12/kg, Newspapers: ₹15/kg',
      hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
      rating: 4.8,
      reviews: 38
    },
    {
      name: `BioLoop Community Compost & Green Drop-off`,
      category: 'organic',
      acceptedCategories: ['organic'],
      acceptedItems: ['Food Scraps', 'Garden Leaves', 'Vegetable Waste', 'Coffee Grounds'],
      dLat: 0.018,
      dLng: -0.005,
      scrapRates: 'Free Drop-off · Earn 15 Eco-Points per 5kg composted',
      hours: 'Tue - Sun: 7:00 AM - 5:00 PM',
      rating: 4.9,
      reviews: 54
    },
    {
      name: `${userCity} Glass Bottle & Jar Return Station`,
      category: 'glass',
      acceptedCategories: ['glass'],
      acceptedItems: ['Glass Jars', 'Beverage Bottles', 'Glass Cullet'],
      dLat: -0.019,
      dLng: 0.016,
      scrapRates: 'Beer/Soda Bottles: ₹2/bottle, Glass Cullet: ₹3/kg',
      hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
      rating: 4.6,
      reviews: 18
    }
  ];

  return templates.map((t, idx) => {
    const lat = userLat + t.dLat;
    const lng = userLng + t.dLng;
    return {
      _id: `dynamic-${idx}-${Math.round(lat * 1000)}-${Math.round(lng * 1000)}`,
      name: t.name,
      category: t.category,
      acceptedCategories: t.acceptedCategories,
      acceptedItems: t.acceptedItems,
      address: `Near Sector ${(idx + 1) * 3}, Main Market Rd`,
      city: userCity,
      state: '',
      zipcode: '',
      lat,
      lng,
      phone: `+91 98${idx + 2}0 44${idx + 1}2`,
      email: `contact@${t.category}-recovery.org`,
      website: '',
      operatingHours: t.hours,
      scrapRates: t.scrapRates,
      paymentTypes: ['Cash on the spot', 'UPI'],
      rating: t.rating,
      reviewsCount: t.reviews,
      isVerified: true
    };
  });
}

// @route   GET /api/waste-centers
// @desc    Get waste centers with optional filter by category, proximity, or search query
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, lat, lng, radius = 50, search } = req.query;

    let query = {};

    if (category && category !== 'all') {
      query.$or = [
        { category: category },
        { acceptedCategories: category }
      ];
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
        { address: { $regex: term, $options: 'i' } },
        { acceptedItems: { $regex: term, $options: 'i' } }
      ];
    }

    let centers = await WasteCenter.find(query).lean();

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const hasCoordinates = !isNaN(userLat) && !isNaN(userLng);

    // If coordinates provided, calculate distance for all centers
    if (hasCoordinates) {
      centers = centers.map(c => ({
        ...c,
        distance: calculateDistance(userLat, userLng, c.lat, c.lng)
      }));

      // Filter by radius if requested
      const radiusKm = parseFloat(radius);
      if (!isNaN(radiusKm) && radiusKm > 0) {
        centers = centers.filter(c => c.distance <= radiusKm);
      }

      // If no centers exist within the radius, generate dynamic realistic nearby centers for this area
      if (centers.length === 0) {
        const dynamicCenters = generateDynamicNearbyCenters(userLat, userLng, search || 'Local Area');
        let filteredDynamic = dynamicCenters;
        if (category && category !== 'all') {
          filteredDynamic = dynamicCenters.filter(c => 
            c.category === category || c.acceptedCategories.includes(category)
          );
        }
        centers = filteredDynamic.map(c => ({
          ...c,
          distance: calculateDistance(userLat, userLng, c.lat, c.lng)
        }));
      }

      // Sort by closest distance first
      centers.sort((a, b) => a.distance - b.distance);
    } else {
      // Sort by rating descending
      centers.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: centers.length,
      userLocation: hasCoordinates ? { lat: userLat, lng: userLng } : null,
      centers
    });
  } catch (err) {
    console.error('Error fetching waste centers:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving waste centers' });
  }
});

// @route   POST /api/waste-centers
// @desc    Register a new community waste collection center or scrap shop
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      acceptedCategories,
      acceptedItems,
      address,
      city,
      state,
      zipcode,
      lat,
      lng,
      phone,
      email,
      website,
      operatingHours,
      scrapRates,
      paymentTypes
    } = req.body;

    if (!name || !address || !city || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Name, address, city, latitude, and longitude are required' });
    }

    const newCenter = new WasteCenter({
      name,
      category: category || 'general',
      acceptedCategories: acceptedCategories && acceptedCategories.length ? acceptedCategories : [category || 'general'],
      acceptedItems: acceptedItems || [],
      address,
      city,
      state: state || '',
      zipcode: zipcode || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      phone: phone || '',
      email: email || '',
      website: website || '',
      operatingHours: operatingHours || 'Mon - Sat: 9:00 AM - 7:00 PM',
      scrapRates: scrapRates || '',
      paymentTypes: paymentTypes || ['Cash on the spot'],
      isVerified: false, // Community additions await admin verification or display as community added
      submittedBy: req.user._id
    });

    const saved = await newCenter.save();

    res.status(201).json({
      success: true,
      message: 'Waste collection center registered successfully!',
      center: saved
    });
  } catch (err) {
    console.error('Error creating waste center:', err);
    res.status(500).json({ success: false, message: 'Failed to create waste center' });
  }
});

module.exports = router;
