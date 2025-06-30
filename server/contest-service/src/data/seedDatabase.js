const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const contestData = require('./contestData');
const submissionData = require('./submissionData');

// Database connection (adjust the connection string as needed)
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/contest-service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Contest.deleteMany({});
    await Submission.deleteMany({});
    console.log('Cleared existing data');

    // Insert submissions first
    const insertedSubmissions = await Submission.insertMany(submissionData);
    console.log(`Inserted ${insertedSubmissions.length} submissions`);

    // Update contest data with actual submission IDs
    const updatedContestData = contestData.map((contest, index) => {
      const contestSubmissions = [];
      
      // Assign submissions to contests based on the dummy data structure
      switch (index) {
        case 0: // First contest
          contestSubmissions.push(...insertedSubmissions.slice(0, 3).map(sub => sub._id));
          break;
        case 1: // Second contest
          contestSubmissions.push(...insertedSubmissions.slice(3, 5).map(sub => sub._id));
          break;
        case 3: // Fourth contest (skip third as it has no submissions)
          contestSubmissions.push(...insertedSubmissions.slice(0, 4).map(sub => sub._id));
          break;
        default:
          // No submissions for other contests
          break;
      }

      return {
        ...contest,
        submissions: contestSubmissions
      };
    });

    // Insert contests with updated submission references
    const insertedContests = await Contest.insertMany(updatedContestData);
    console.log(`Inserted ${insertedContests.length} contests`);

    console.log('Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`- ${insertedSubmissions.length} submissions created`);
    console.log(`- ${insertedContests.length} contests created`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
