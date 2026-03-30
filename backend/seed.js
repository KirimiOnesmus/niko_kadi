const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Center = require("./models/centers");
const QueueReport = require("./models/queuereport");

dotenv.config();

const ALL_IEBC_CENTERS = require("./centers_geocoded.json");

function getRandomWaitTime() {
  const statuses = ["FAST MOVING", "MODERATE", "LONG WAIT", "VERY LONG"];
  const weights = [0.4, 0.35, 0.2, 0.05];

  const random = Math.random();
  let cumulative = 0;
  let statusIndex = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      statusIndex = i;
      break;
    }
  }

  const waitTimes = {
    "FAST MOVING": Math.floor(Math.random() * 15),
    "MODERATE": Math.floor(Math.random() * 30) + 15,
    "LONG WAIT": Math.floor(Math.random() * 45) + 45,
    "VERY LONG": Math.floor(Math.random() * 60) + 90,
  };

  const status = statuses[statusIndex];
  return { waitTime: waitTimes[status], status };
}

function fakeUserLocation(centerLat, centerLng) {
  const offset = () => (Math.random() - 0.5) * 0.004;
  return { lat: centerLat + offset(), lng: centerLng + offset() };
}

function toDoc(c) {
  return {
    name: c.name,
    location: c.location,
    county: c.county,
    constituency: c.constituency,
    ward: "",
    type: "sub-county_office",
    address: c.location,
    landmark: c.landmark,

    coordinates: {
      lat: c.coordinates.lat,
      lng: c.coordinates.lng
    },

    geoLocation: {
      type: "Point",
      coordinates: [c.coordinates.lng, c.coordinates.lat]
    },

    submittedBy: "admin",
    isActive: true,
    isVerified: true,
    verificationCount: 3,
    verificationThreshold: 3,
    verifiers: [],

    workingHours: "8:00 AM - 5:00 PM",

    currentQueue: {
      status: "FAST MOVING",
      waitTime: 0,
      reportCount: 0
    }
  };
}

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ,
    );
    console.log("Connected to MongoDB");

    await Center.deleteMany({});
    await QueueReport.deleteMany({});
    console.log("Cleared existing data");

 const centersWithQueue = ALL_IEBC_CENTERS.map(center => {
  const base = toDoc(center);

  return {
    ...base,
    county: normalizeCounty(center.county),
    ward: center.constituency,
    currentQueue: {
      ...getRandomWaitTime(),
      lastUpdated: new Date()
    },
    totalCheckIns: Math.floor(Math.random() * 500),
    workingHours: '8:00 AM - 5:00 PM'
  };
});

function normalizeCounty(name) {
  if (!name) return name;

  return name
    .replace(/county/i, '')   // remove "county"
    .replace(/-/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

    const centers = await Center.insertMany(centersWithQueue);
    // console.log(`Inserted ${centers.length} IEBC centers`);

    const allCounties = [...new Set(centers.map((c) => c.county))];

    const queueReports = [];
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    for (let i = 0; i < 500; i++) {
      const center = centers[Math.floor(Math.random() * centers.length)];
      const statuses = ["short", "moderate", "long", "verylong"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const waitTimeMap = {
        short: Math.floor(Math.random() * 15),
        moderate: Math.floor(Math.random() * 30) + 15,
        long: Math.floor(Math.random() * 45) + 45,
        verylong: Math.floor(Math.random() * 60) + 90,
      };

      const reportTime = new Date(
        twoHoursAgo.getTime() + Math.random() * 2 * 60 * 60 * 1000,
      );
      const userLoc = fakeUserLocation(
        center.coordinates.lat,
        center.coordinates.lng,
      );

      queueReports.push({
        centerId: center._id,
        waitTime: waitTimeMap[status],
        status,
        createdAt: reportTime,
        userLocation: { lat: userLoc.lat, lng: userLoc.lng },
        distanceFromCenter: Math.floor(Math.random() * 400) + 10, // 10-410 metres
        isVerified: true,
        source: "web",
        votes: {
          helpful: Math.floor(Math.random() * 10),
          notHelpful: Math.floor(Math.random() * 3),
        },
      });
    }

    await QueueReport.insertMany(queueReports);
    console.log(`Inserted ${queueReports.length} queue reports`);

    // console.log("\n DATABASE SEEDED SUCCESSFULLY!");
    // console.log("=".repeat(70));
    // console.log(`Total IEBC Centers : ${centers.length}`);
    // console.log(`Counties Covered   : ${allCounties.length} / 47`);
    // console.log(`Queue Reports      : ${queueReports.length}`);
    // console.log("=".repeat(70));

    // console.log("\nCENTERS BY COUNTY:");
    const countyCounts = {};
    centers.forEach((c) => {
      countyCounts[c.county] = (countyCounts[c.county] || 0) + 1;
    });

    Object.entries(countyCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([county, count]) => {
        console.log(`   ${county.padEnd(20)} : ${count} centers`);
      });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
