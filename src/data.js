export const starterProfile = {
  name: "", age: 20, occupation: "Student", college: "DTU",
  location: "North Delhi", budgetMin: 8000, budgetMax: 15000,
  moveIn: "Flexible", sleep: "Night owl", cleanliness: "Very tidy",
  social: "Balanced", guests: "Sometimes", smoking: "No",
  food: "Non-vegetarian", noise: "Moderate", personalSpace: "High",
  roomType: "Either", bio: "",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600"
};

export const demoUsers = [
  {
    id:"u1", name:"Aarav", age:21, occupation:"BTech student", college:"DTU",
    location:"Rohini", budgetMin:9000, budgetMax:14000, moveIn:"December",
    sleep:"Night owl", cleanliness:"Very tidy", social:"Balanced", guests:"Sometimes",
    smoking:"No", food:"Non-vegetarian", noise:"Moderate", personalSpace:"High",
    roomType:"Either", bio:"Big on music, late-night conversations and keeping shared spaces clean.",
    avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
    tags:["Music","Gym","Night owl"]
  },
  {
    id:"u2", name:"Meera", age:20, occupation:"Design student", college:"NSUT",
    location:"Dwarka", budgetMin:10000, budgetMax:16000, moveIn:"January",
    sleep:"Early bird", cleanliness:"Very tidy", social:"Introvert", guests:"Rarely",
    smoking:"No", food:"Vegetarian", noise:"Quiet", personalSpace:"High",
    roomType:"Single", bio:"Design student who loves plants, coffee and peaceful weekends.",
    avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
    tags:["Design","Plants","Coffee"]
  },
  {
    id:"u3", name:"Kabir", age:22, occupation:"Software developer", college:"Working professional",
    location:"Pitampura", budgetMin:12000, budgetMax:18000, moveIn:"November",
    sleep:"Flexible", cleanliness:"Moderate", social:"Extrovert", guests:"Frequently",
    smoking:"No", food:"Non-vegetarian", noise:"Doesn't matter", personalSpace:"Moderate",
    roomType:"Either", bio:"Working in tech. Into football, cooking and exploring new places.",
    avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
    tags:["Football","Cooking","Tech"]
  },
  {
    id:"u4", name:"Ananya", age:21, occupation:"MBA student", college:"Delhi University",
    location:"Model Town", budgetMin:8000, budgetMax:13000, moveIn:"December",
    sleep:"Early bird", cleanliness:"Very tidy", social:"Balanced", guests:"Sometimes",
    smoking:"No", food:"Vegetarian", noise:"Quiet", personalSpace:"Moderate",
    roomType:"Either", bio:"Organised, friendly and always up for finding a new brunch spot.",
    avatar:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
    tags:["Reading","Foodie","Fitness"]
  },
  {
    id:"u5", name:"Rohan", age:23, occupation:"Product designer", college:"Working professional",
    location:"Rohini", budgetMin:11000, budgetMax:17000, moveIn:"Flexible",
    sleep:"Night owl", cleanliness:"Moderate", social:"Balanced", guests:"Sometimes",
    smoking:"Occasionally", food:"Non-vegetarian", noise:"Moderate", personalSpace:"High",
    roomType:"Either", bio:"Designing by day, gaming by night. Looking for a chill, respectful home.",
    avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    tags:["Gaming","Design","Movies"]
  },
  {
    id:"u6", name:"Ishita", age:20, occupation:"Law student", college:"NLU Delhi",
    location:"Rohini", budgetMin:7000, budgetMax:12000, moveIn:"January",
    sleep:"Flexible", cleanliness:"Very tidy", social:"Introvert", guests:"Rarely",
    smoking:"No", food:"Vegetarian", noise:"Quiet", personalSpace:"High",
    roomType:"Single", bio:"Quiet, considerate and happiest with books, films and good chai.",
    avatar:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
    tags:["Books","Films","Chai"]
  }
];

export const questions = [
  {key:"sleep", title:"When does your day usually end?", subtitle:"Sleep schedules matter more than people think.", options:["Early bird","Night owl","Flexible"]},
  {key:"cleanliness", title:"How do you like your space?", subtitle:"No judgement. Just honest expectations.", options:["Very tidy","Moderate","Relaxed"]},
  {key:"social", title:"What's your social battery like?", subtitle:"Think about everyday life at home.", options:["Introvert","Balanced","Extrovert"]},
  {key:"guests", title:"How often should friends come over?", subtitle:"A common source of roommate friction.", options:["Rarely","Sometimes","Frequently"]},
  {key:"smoking", title:"What's your stance on smoking?", subtitle:"You can make this a deal-breaker.", options:["No","Occasionally","Comfortable with it"]},
  {key:"food", title:"What's your food preference?", subtitle:"Useful for planning a shared kitchen.", options:["Vegetarian","Non-vegetarian","Vegan","Doesn't matter"]},
  {key:"noise", title:"What's your ideal home environment?", subtitle:"Especially important during study or work.", options:["Quiet","Moderate","Doesn't matter"]},
  {key:"personalSpace", title:"How much personal space do you need?", subtitle:"How much time do you like to spend independently?", options:["High","Moderate","Low"]}
];