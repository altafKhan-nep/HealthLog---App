import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./auth/auth.model";
import { Hospital } from "./hospitals/hospital.model";
import { Visit } from "./visits/visit.model";

const MONGODB_URI = process.env.MONGODB_URI as string;

const globalHospitals = [
  { name: "B.P. Koirala Institute of Health Sciences", location: "Dharan, Sunsari", type: "hospital" as const },
  { name: "Nepal Mediciti Hospital", location: "Sainbu, Bhaktapur", type: "hospital" as const },
  { name: "Grande International Hospital", location: "Tinkune, Kathmandu", type: "hospital" as const },
  { name: "Kathmandu Medical College", location: "Sinamangal, Kathmandu", type: "hospital" as const },
  { name: "Tribhuvan University Teaching Hospital", location: "Maharajgunj, Kathmandu", type: "hospital" as const },
  { name: "Nepal Medical College", location: "Jorpati, Kathmandu", type: "hospital" as const },
  { name: "Patan Hospital", location: "Lagankhel, Lalitpur", type: "hospital" as const },
  { name: "Manipal Teaching Hospital", location: "Pokhara, Kaski", type: "hospital" as const },
  { name: "Civil Service Hospital", location: "Minbhawan, Kathmandu", type: "hospital" as const },
  { name: "Om Hospital", location: "Putalisadak, Kathmandu", type: "clinic" as const },
  { name: "Lumbini Medical College", location: "Bhairahawa, Rupandehi", type: "hospital" as const },
  { name: "Western Regional Hospital", location: "Pokhara, Kaski", type: "hospital" as const },
  { name: "Dhulikhel Hospital", location: "Dhulikhel, Kavrepalanchok", type: "hospital" as const },
  { name: "Nobel Medical College", location: "Biratnagar, Morang", type: "hospital" as const },
  { name: "Janaki Medical College", location: "Janakpur, Dhanusha", type: "hospital" as const },
];

const doctors: Record<string, string[]> = {
  "B.P. Koirala Institute of Health Sciences": ["Dr. Ramesh Adhikari", "Dr. Suman K.C.", "Dr. Anita Sharma"],
  "Nepal Mediciti Hospital": ["Dr. Bikash Koirala", "Dr. Priya Thapa", "Dr. Rajesh Gupta"],
  "Grande International Hospital": ["Dr. Prakash Bikram Shah", "Dr. Nisha Maharjan", "Dr. Arjun Das"],
  "Kathmandu Medical College": ["Dr. Sushil Koirala", "Dr. Kamala Shrestha", "Dr. Deepak Rai"],
  "Tribhuvan University Teaching Hospital": ["Dr. Bhola Rijal", "Dr. Sarita Lamichhane", "Dr. Mohan Krishna Shrestha"],
  "Nepal Medical College": ["Dr. Kiran Bista", "Dr. Anju Gurung", "Dr. Rajan Pandey"],
  "Patan Hospital": ["Dr. Hira Kaji Manandhar", "Dr. Sunita Shakya", "Dr. Prabin Kumar Das"],
  "Manipal Teaching Hospital": ["Dr. Gopal Sedhai", "Dr. Rita Bhandari", "Dr. Santosh Khanal"],
  "Civil Service Hospital": ["Dr. Chandra Kishor Jha", "Dr. Laxmi Devkota", "Dr. Prakash Chandra Tiwari"],
  "Om Hospital": ["Dr. Raju Adhikari", "Dr. Neelam Karki"],
  "Lumbini Medical College": ["Dr. Hari Bahadur Thapa", "Dr. Krishna Prasad Adhikari"],
  "Western Regional Hospital": ["Dr. Ram Hari Poudel", "Dr. Sushila Bhattarai"],
  "Dhulikhel Hospital": ["Dr. Manoj Lama", "Dr. Kabita Shrestha"],
  "Nobel Medical College": ["Dr. Arvind Kumar Singh", "Dr. Pooja Kumari"],
  "Janaki Medical College": ["Dr. Ramesh Prasad Yadav", "Dr. Sunita Devi"],
};

const testReports = [
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your fasting blood sugar level is 126 mg/dL, which is slightly higher than the normal range (70-100 mg/dL). This reading is often used by doctors to check how your body processes sugar. Your doctor may discuss dietary changes or further testing at your next visit.",
      testResults: [
        { testName: "Fasting Blood Sugar", value: 126, unit: "mg/dL", referenceRange: "70-100" },
        { testName: "HbA1c", value: 7.2, unit: "%", referenceRange: "4.0-5.6" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your blood pressure reading of 140/90 mmHg is in the elevated range. Blood pressure measures the force of blood against your artery walls. Regular monitoring and lifestyle changes may help.",
      testResults: [
        { testName: "Blood Pressure Systolic", value: 140, unit: "mmHg", referenceRange: "90-120" },
        { testName: "Blood Pressure Diastolic", value: 90, unit: "mmHg", referenceRange: "60-80" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your cholesterol panel shows elevated total cholesterol at 245 mg/dL. These numbers relate to heart health and your doctor may recommend dietary changes or medication.",
      testResults: [
        { testName: "Total Cholesterol", value: 245, unit: "mg/dL", referenceRange: "<200" },
        { testName: "Fasting Blood Sugar", value: 138, unit: "mg/dL", referenceRange: "70-100" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your complete blood count results are mostly within normal ranges. Hemoglobin at 12.8 g/dL is within range. White blood cell count is normal.",
      testResults: [
        { testName: "Hemoglobin", value: 12.8, unit: "g/dL", referenceRange: "12-16" },
        { testName: "Fasting Blood Sugar", value: 112, unit: "mg/dL", referenceRange: "70-100" },
        { testName: "Total Cholesterol", value: 210, unit: "mg/dL", referenceRange: "<200" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your thyroid function test shows TSH at 6.8 mIU/L, which is slightly elevated. An elevated level may indicate your thyroid is underactive.",
      testResults: [
        { testName: "TSH", value: 6.8, unit: "mIU/L", referenceRange: "0.4-4.0" },
        { testName: "Fasting Blood Sugar", value: 105, unit: "mg/dL", referenceRange: "70-100" },
      ],
    },
  },
  {
    tag: "consultation" as const,
    extractedFields: {
      diagnosis: "Mild vitamin D deficiency",
      medication: "Vitamin D3 supplementation - 60,000 IU once weekly for 8 weeks",
      plainLanguageSummary: "Your vitamin D level is 18 ng/mL, which is below the sufficient range. Your doctor has prescribed a weekly supplement for 8 weeks.",
      testResults: [
        { testName: "Vitamin D", value: 18, unit: "ng/mL", referenceRange: "30-100" },
        { testName: "Fasting Blood Sugar", value: 132, unit: "mg/dL", referenceRange: "70-100" },
        { testName: "Hemoglobin", value: 13.5, unit: "g/dL", referenceRange: "12-16" },
      ],
    },
  },
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("[seed] Connected to MongoDB");

  await User.deleteMany({});
  await Hospital.deleteMany({});
  await Visit.deleteMany({});
  console.log("[seed] Cleared existing data");

  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await User.create({
    name: "Altaf Khan",
    email: "altaf@test.com",
    passwordHash,
  });
  console.log("[seed] Created user: altaf@test.com / password123");

  const globalHospitalDocs = [];
  for (const h of globalHospitals) {
    const doc = await Hospital.create({ ...h, isGlobal: true });
    globalHospitalDocs.push(doc);
  }
  console.log(`[seed] Created ${globalHospitalDocs.length} global hospitals`);

  const visits = [
    { hospitalIdx: 0, report: testReports[0], date: new Date("2026-01-15"), doctor: "Dr. Ramesh Adhikari" },
    { hospitalIdx: 2, report: testReports[1], date: new Date("2026-03-20"), doctor: "Dr. Prakash Bikram Shah" },
    { hospitalIdx: 4, report: testReports[2], date: new Date("2026-04-10"), doctor: "Dr. Bhola Rijal" },
    { hospitalIdx: 1, report: testReports[3], date: new Date("2026-06-05"), doctor: "Dr. Bikash Koirala" },
    { hospitalIdx: 6, report: testReports[4], date: new Date("2026-07-18"), doctor: "Dr. Hira Kaji Manandhar" },
    { hospitalIdx: 3, report: testReports[5], date: new Date("2026-08-20"), doctor: "Dr. Sushil Koirala" },
  ];

  for (const v of visits) {
    const hospital = globalHospitalDocs[v.hospitalIdx];
    await Visit.create({
      userId: user._id,
      hospitalId: hospital._id,
      visitDate: v.date,
      doctorName: v.doctor,
      tag: v.report.tag,
      status: "ready",
      entryMethod: "manual",
      extractedFields: v.report.extractedFields,
    });

    await Hospital.findByIdAndUpdate(hospital._id, {
      $inc: { visitCount: 1 },
      $set: { lastVisitDate: v.date },
      $min: { firstVisitDate: v.date },
    });
  }
  console.log(`[seed] Created ${visits.length} sample visits for Altaf`);

  const user2 = await User.create({
    name: "Sita Devi",
    email: "sita@test.com",
    passwordHash,
  });

  user.careCircleMembers.push(user2._id);
  await user.save();

  const sitaVisits = [
    { hospitalIdx: 10, report: testReports[0], date: new Date("2026-02-10"), doctor: "Dr. Hari Bahadur Thapa" },
    { hospitalIdx: 11, report: testReports[3], date: new Date("2026-05-22"), doctor: "Dr. Ram Hari Poudel" },
  ];

  for (const v of sitaVisits) {
    const hospital = globalHospitalDocs[v.hospitalIdx];
    await Visit.create({
      userId: user2._id,
      hospitalId: hospital._id,
      visitDate: v.date,
      doctorName: v.doctor,
      tag: v.report.tag,
      status: "ready",
      entryMethod: "manual",
      extractedFields: v.report.extractedFields,
    });
    await Hospital.findByIdAndUpdate(hospital._id, {
      $inc: { visitCount: 1 },
      $set: { lastVisitDate: v.date },
      $min: { firstVisitDate: v.date },
    });
  }
  console.log("[seed] Created Care Circle user (sita@test.com) with 2 visits");

  await mongoose.disconnect();
  console.log("[seed] Done!");
  console.log("\n--- Login credentials ---");
  console.log("Altaf: altaf@test.com / password123");
  console.log("Sita:  sita@test.com  / password123");
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
