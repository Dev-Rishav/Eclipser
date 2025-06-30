const { ObjectId } = require('mongodb');

const contestData = [
  {
    users: ["user_12345", "user_67890", "user_11111"],
    problemId: "problem_001",
    startTime: new Date("2025-06-30T10:00:00Z"),
    endTime: new Date("2025-06-30T12:00:00Z"),
    status: "finished",
    submissions: [
      new ObjectId("66a1b2c3d4e5f6789abcdef0"),
      new ObjectId("66a1b2c3d4e5f6789abcdef1"),
      new ObjectId("66a1b2c3d4e5f6789abcdef2")
    ],
    winner: "user_12345"
  },
  {
    users: ["user_22222", "user_33333", "user_44444", "user_55555"],
    problemId: "problem_002",
    startTime: new Date("2025-07-01T14:00:00Z"),
    endTime: new Date("2025-07-01T16:00:00Z"),
    status: "running",
    submissions: [
      new ObjectId("66a1b2c3d4e5f6789abcdef3"),
      new ObjectId("66a1b2c3d4e5f6789abcdef4")
    ],
    winner: null
  },
  {
    users: ["user_66666", "user_77777", "user_88888"],
    problemId: "problem_003",
    startTime: new Date("2025-07-02T09:00:00Z"),
    endTime: new Date("2025-07-02T11:00:00Z"),
    status: "pending",
    submissions: [],
    winner: null
  },
  {
    users: ["user_12345", "user_22222", "user_99999", "user_10101"],
    problemId: "problem_004",
    startTime: new Date("2025-06-29T16:00:00Z"),
    endTime: new Date("2025-06-29T18:00:00Z"),
    status: "finished",
    submissions: [
      new ObjectId("66a1b2c3d4e5f6789abcdef5"),
      new ObjectId("66a1b2c3d4e5f6789abcdef6"),
      new ObjectId("66a1b2c3d4e5f6789abcdef7"),
      new ObjectId("66a1b2c3d4e5f6789abcdef8")
    ],
    winner: "user_22222"
  },
  {
    users: ["user_11111", "user_33333", "user_55555", "user_77777", "user_99999"],
    problemId: "problem_005",
    startTime: new Date("2025-07-03T13:00:00Z"),
    endTime: new Date("2025-07-03T15:30:00Z"),
    status: "pending",
    submissions: [],
    winner: null
  }
];

module.exports = contestData;
