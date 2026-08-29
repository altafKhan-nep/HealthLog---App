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
        { testName: "LDL Cholesterol", value: 165, unit: "mg/dL", referenceRange: "<100" },
        { testName: "HDL Cholesterol", value: 38, unit: "mg/dL", referenceRange: ">40" },
        { testName: "Triglycerides", value: 195, unit: "mg/dL", referenceRange: "<150" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your complete blood count results are mostly within normal ranges. Hemoglobin at 12.8 g/dL is within range. White blood cell count is normal. No signs of infection detected.",
      testResults: [
        { testName: "Hemoglobin", value: 12.8, unit: "g/dL", referenceRange: "12-16" },
        { testName: "White Blood Cells", value: 7.2, unit: "K/µL", referenceRange: "4.5-11.0" },
        { testName: "Platelets", value: 245, unit: "K/µL", referenceRange: "150-400" },
        { testName: "Red Blood Cells", value: 4.8, unit: "M/µL", referenceRange: "4.5-5.5" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your thyroid function test shows TSH at 6.8 mIU/L, which is slightly elevated. An elevated level may indicate your thyroid is underactive (hypothyroidism). Your doctor may recommend further testing or medication.",
      testResults: [
        { testName: "TSH", value: 6.8, unit: "mIU/L", referenceRange: "0.4-4.0" },
        { testName: "Free T4", value: 0.9, unit: "ng/dL", referenceRange: "0.8-1.8" },
      ],
    },
  },
  {
    tag: "consultation" as const,
    extractedFields: {
      diagnosis: "Mild vitamin D deficiency",
      medication: "Vitamin D3 supplementation - 60,000 IU once weekly for 8 weeks",
      plainLanguageSummary: "Your vitamin D level is 18 ng/mL, which is below the sufficient range (30-100 ng/mL). Your doctor has prescribed a weekly supplement for 8 weeks. Follow up after completion recommended.",
      testResults: [
        { testName: "Vitamin D", value: 18, unit: "ng/mL", referenceRange: "30-100" },
        { testName: "Calcium", value: 9.2, unit: "mg/dL", referenceRange: "8.5-10.5" },
      ],
    },
  },
  {
    tag: "prescription" as const,
    extractedFields: {
      diagnosis: "Type 2 Diabetes Mellitus - Uncontrolled",
      medication: "Metformin 500mg twice daily, Glimepiride 2mg once daily, Vitamin D3 60,000 IU weekly",
      plainLanguageSummary: "You have been prescribed medications to manage your blood sugar levels. Metformin helps your body use insulin better. Glimepiride helps your pancreas produce more insulin. Take with meals to reduce stomach upset.",
      testResults: [
        { testName: "Fasting Blood Sugar", value: 158, unit: "mg/dL", referenceRange: "70-100" },
        { testName: "HbA1c", value: 8.1, unit: "%", referenceRange: "4.0-5.6" },
      ],
    },
  },
  {
    tag: "consultation" as const,
    extractedFields: {
      diagnosis: "Hypertension Stage 1, Essential",
      medication: "Amlodipine 5mg once daily, lifestyle modifications",
      plainLanguageSummary: "Your blood pressure has been consistently elevated. You have been started on Amlodipine, a calcium channel blocker that helps relax blood vessels. Continue monitoring at home and reduce salt intake.",
      testResults: [
        { testName: "Blood Pressure Systolic", value: 148, unit: "mmHg", referenceRange: "90-120" },
        { testName: "Blood Pressure Diastolic", value: 92, unit: "mmHg", referenceRange: "60-80" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your liver function tests are within normal range. ALT and AST levels indicate healthy liver function. No signs of liver damage or inflammation detected.",
      testResults: [
        { testName: "ALT", value: 28, unit: "U/L", referenceRange: "7-56" },
        { testName: "AST", value: 24, unit: "U/L", referenceRange: "10-40" },
        { testName: "Alkaline Phosphatase", value: 72, unit: "U/L", referenceRange: "44-147" },
        { testName: "Bilirubin", value: 0.8, unit: "mg/dL", referenceRange: "0.1-1.2" },
      ],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your kidney function tests are normal. Creatinine at 0.9 mg/dL indicates good kidney function. BUN is within normal limits. No signs of kidney disease detected.",
      testResults: [
        { testName: "Creatinine", value: 0.9, unit: "mg/dL", referenceRange: "0.6-1.2" },
        { testName: "BUN", value: 15, unit: "mg/dL", referenceRange: "7-20" },
        { testName: "eGFR", value: 95, unit: "mL/min", referenceRange: ">60" },
      ],
    },
  },
  {
    tag: "vaccination" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "You have received your annual influenza vaccination. Side effects like mild fever or soreness at the injection site are normal and should resolve within 1-2 days. Stay hydrated and rest.",
      testResults: [],
    },
  },
  {
    tag: "consultation" as const,
    extractedFields: {
      diagnosis: "Acute Lower Respiratory Tract Infection",
      medication: "Amoxicillin 500mg three times daily for 7 days, Paracetamol 500mg as needed for fever, Steam inhalation",
      plainLanguageSummary: "You have a chest infection caused by bacteria. The antibiotic will kill the infection. Complete the full course even if you feel better. Drink plenty of fluids and rest for 5-7 days.",
      testResults: [],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your iron studies show low ferritin at 12 ng/mL, indicating iron deficiency. Hemoglobin is borderline at 11.2 g/dL. Your doctor may recommend iron supplementation.",
      testResults: [
        { testName: "Ferritin", value: 12, unit: "ng/mL", referenceRange: "20-200" },
        { testName: "Hemoglobin", value: 11.2, unit: "g/dL", referenceRange: "12-16" },
        { testName: "Iron", value: 45, unit: "µg/dL", referenceRange: "60-170" },
        { testName: "TIBC", value: 420, unit: "µg/dL", referenceRange: "250-370" },
      ],
    },
  },
  {
    tag: "consultation" as const,
    extractedFields: {
      diagnosis: "GERD (Gastroesophageal Reflux Disease)",
      medication: "Pantoprazole 40mg once daily before breakfast, Domperidone 10mg before meals",
      plainLanguageSummary: "You have acid reflux disease. The medications will reduce stomach acid and help food move through your stomach faster. Avoid spicy food, eat smaller meals, and don't lie down immediately after eating.",
      testResults: [],
    },
  },
  {
    tag: "surgery" as const,
    extractedFields: {
      diagnosis: "Right Inguinal Hernia",
      medication: "Post-operative: Paracetamol 500mg every 8 hours for 5 days, Ibuprofen 400mg every 8 hours for 3 days",
      plainLanguageSummary: "You have undergone laparoscopic hernia repair surgery. The repair was successful. Avoid heavy lifting for 6 weeks. Keep the wound dry for 48 hours. Follow up in 1 week for wound check.",
      testResults: [],
    },
  },
  {
    tag: "lab_test" as const,
    extractedFields: {
      diagnosis: null,
      medication: null,
      plainLanguageSummary: "Your lipid profile shows mixed dyslipidemia. Total cholesterol and LDL are elevated while HDL is low. This increases your cardiovascular risk. Lifestyle changes and possibly statin therapy recommended.",
      testResults: [
        { testName: "Total Cholesterol", value: 238, unit: "mg/dL", referenceRange: "<200" },
        { testName: "LDL Cholesterol", value: 158, unit: "mg/dL", referenceRange: "<100" },
        { testName: "HDL Cholesterol", value: 35, unit: "mg/dL", referenceRange: ">40" },
        { testName: "Triglycerides", value: 185, unit: "mg/dL", referenceRange: "<150" },
      ],
    },
  },
];

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

  // === User 1: Altaf Khan (Main user) ===
  const altaf = await User.create({
    name: "Altaf Khan",
    email: "altaf@test.com",
    passwordHash,
    phone: "+977-9841234567",
    dateOfBirth: new Date("1995-06-15"),
    gender: "Male",
    bloodType: "B+",
    emergencyContact: {
      name: "Fatima Khan",
      phone: "+977-9851234567",
      relationship: "Sister",
    },
  });
  console.log("[seed] Created user: altaf@test.com / password123");

  // === User 2: Sita Devi (Care circle) ===
  const sita = await User.create({
    name: "Sita Devi",
    email: "sita@test.com",
    passwordHash,
    phone: "+977-9861234567",
    dateOfBirth: new Date("1990-03-22"),
    gender: "Female",
    bloodType: "A+",
    emergencyContact: {
      name: "Ram Devi",
      phone: "+977-9871234567",
      relationship: "Husband",
    },
  });

  // === User 3: Arjun Sharma (Care circle) ===
  const arjun = await User.create({
    name: "Arjun Sharma",
    email: "arjun@test.com",
    passwordHash,
    phone: "+977-9881234567",
    dateOfBirth: new Date("1988-11-10"),
    gender: "Male",
    bloodType: "O+",
    emergencyContact: {
      name: "Maya Sharma",
      phone: "+977-9891234567",
      relationship: "Wife",
    },
  });

  // Setup care circle
  altaf.careCircleMembers.push(sita._id, arjun._id);
  sita.careCircleMembers.push(altaf._id);
  await altaf.save();
  await sita.save();
  console.log("[seed] Created 3 users with care circle connections");

  // Create all hospitals
  const hospitalDocs: any[] = [];
  for (const h of globalHospitals) {
    const doc = await Hospital.create({ ...h, isGlobal: true });
    hospitalDocs.push(doc);
  }
  console.log(`[seed] Created ${hospitalDocs.length} global hospitals`);

  // === Altaf's visits (8 visits over 12 months) ===
  const altafVisits = [
    { hospitalIdx: 2, report: testReports[0], date: new Date("2025-11-15"), doctor: "Dr. Prakash Bikram Shah" },
    { hospitalIdx: 4, report: testReports[1], date: new Date("2025-12-20"), doctor: "Dr. Bhola Rijal" },
    { hospitalIdx: 1, report: testReports[2], date: new Date("2026-01-10"), doctor: "Dr. Bikash Koirala" },
    { hospitalIdx: 6, report: testReports[5], date: new Date("2026-02-05"), doctor: "Dr. Hira Kaji Manandhar" },
    { hospitalIdx: 0, report: testReports[6], date: new Date("2026-03-18"), doctor: "Dr. Ramesh Adhikari" },
    { hospitalIdx: 3, report: testReports[7], date: new Date("2026-04-22"), doctor: "Dr. Sushil Koirala" },
    { hospitalIdx: 8, report: testReports[11], date: new Date("2026-05-30"), doctor: "Dr. Chandra Kishor Jha" },
    { hospitalIdx: 5, report: testReports[15], date: new Date("2026-06-25"), doctor: "Dr. Kiran Bista" },
    { hospitalIdx: 2, report: testReports[14], date: new Date("2026-07-18"), doctor: "Dr. Nisha Maharjan" },
    { hospitalIdx: 7, report: testReports[9], date: new Date("2026-08-20"), doctor: "Dr. Gopal Sedhai" },
  ];

  for (const v of altafVisits) {
    const hospital = hospitalDocs[v.hospitalIdx];
    await Visit.create({
      userId: altaf._id,
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
  console.log(`[seed] Created ${altafVisits.length} visits for Altaf`);

  // === Sita's visits (5 visits) ===
  const sitaVisits = [
    { hospitalIdx: 10, report: testReports[3], date: new Date("2026-01-20"), doctor: "Dr. Hari Bahadur Thapa" },
    { hospitalIdx: 11, report: testReports[8], date: new Date("2026-03-15"), doctor: "Dr. Ram Hari Poudel" },
    { hospitalIdx: 9, report: testReports[12], date: new Date("2026-05-10"), doctor: "Dr. Raju Adhikari" },
    { hospitalIdx: 13, report: testReports[13], date: new Date("2026-07-05"), doctor: "Dr. Arvind Kumar Singh" },
    { hospitalIdx: 12, report: testReports[10], date: new Date("2026-08-18"), doctor: "Dr. Manoj Lama" },
  ];

  for (const v of sitaVisits) {
    const hospital = hospitalDocs[v.hospitalIdx];
    await Visit.create({
      userId: sita._id,
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
  console.log(`[seed] Created ${sitaVisits.length} visits for Sita`);

  // === Arjun's visits (3 visits) ===
  const arjunVisits = [
    { hospitalIdx: 14, report: testReports[4], date: new Date("2026-02-28"), doctor: "Dr. Ramesh Prasad Yadav" },
    { hospitalIdx: 1, report: testReports[15], date: new Date("2026-05-20"), doctor: "Dr. Priya Thapa" },
    { hospitalIdx: 4, report: testReports[9], date: new Date("2026-08-10"), doctor: "Dr. Sarita Lamichhane" },
  ];

  for (const v of arjunVisits) {
    const hospital = hospitalDocs[v.hospitalIdx];
    await Visit.create({
      userId: arjun._id,
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
  console.log(`[seed] Created ${arjunVisits.length} visits for Arjun`);

  await mongoose.disconnect();
  console.log("\n[seed] Done! Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  USER ACCOUNTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  altaf@test.com   / password123  (10 visits)");
  console.log("  sita@test.com    / password123  (5 visits)");
  console.log("  arjun@test.com   / password123  (3 visits)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  CARE CIRCLE: Altaf ↔ Sita, Arjun");
  console.log("  HOSPITALS:   15 global hospitals");
  console.log("  VISITS:      18 total visits");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  DATA TYPES:");
  console.log("  • Lab tests (blood sugar, cholesterol, CBC, thyroid, liver, kidney, iron)");
  console.log("  • Consultations (vitamin D, hypertension, GERD, respiratory infection)");
  console.log("  • Prescriptions (diabetes medications)");
  console.log("  • Vaccinations (flu shot)");
  console.log("  • Surgery (hernia repair)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
