const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const users = [
  {
    username: "muhammadanas",
    password: "BlotterWithAnas",
  },
  {
    username: "faizann24",
    password: "BlotterWithFaizan",
  },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create new users
    const createdUsers = await Promise.all(
      users.map((user) => User.create(user))
    );

    console.log("Successfully created users:");
    createdUsers.forEach((user) => {
      console.log(`- ${user.username} (ID: ${user._id})`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

// Run the seed function
seedUsers();
