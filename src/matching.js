const weights = {
  budget: 25, cleanliness: 15, sleep: 15, social: 12,
  guests: 10, personalSpace: 8, noise: 7, food: 5, location: 3
};

const exact = (a,b) => a === b ? 100 : 35;
const scale = (a,b,levels) => {
  const x=levels.indexOf(a), y=levels.indexOf(b);
  if(x<0 || y<0) return 50;
  return Math.max(0,100-Math.abs(x-y)*35);
};

export function compatibility(a,b) {
  const budgetOverlap = Math.max(0, Math.min(a.budgetMax,b.budgetMax)-Math.max(a.budgetMin,b.budgetMin));
  const budgetSpan = Math.max(1, Math.max(a.budgetMax-a.budgetMin,b.budgetMax-b.budgetMin));
  const budget = Math.round(Math.min(100, budgetOverlap/budgetSpan*100+25));
  const location = (a.location||"").toLowerCase()===(b.location||"").toLowerCase()?100:55;
  const scores = {
    budget,
    cleanliness: scale(a.cleanliness,b.cleanliness,["Very tidy","Moderate","Relaxed"]),
    sleep: exact(a.sleep,b.sleep),
    social: scale(a.social,b.social,["Introvert","Balanced","Extrovert"]),
    guests: exact(a.guests,b.guests),
    personalSpace: exact(a.personalSpace,b.personalSpace),
    noise: exact(a.noise,b.noise),
    food: exact(a.food,b.food),
    location
  };
  const totalWeight = Object.values(weights).reduce((x,y)=>x+y,0);
  const score = Math.round(Object.entries(weights).reduce((sum,[k,w])=>sum+scores[k]*w,0)/totalWeight);

  const hardConflicts = [];
  if(a.smoking==="No" && b.smoking!=="No") hardConflicts.push("Smoking preferences may not align");
  if(b.smoking==="No" && a.smoking!=="No") hardConflicts.push("Smoking preferences may not align");
  if(b.budgetMax < a.budgetMin || a.budgetMax < b.budgetMin) hardConflicts.push("Rental budgets do not overlap");

  const labels = {
    budget:"Budget", cleanliness:"Cleanliness", sleep:"Sleep schedule",
    social:"Social habits", guests:"Guest preferences",
    personalSpace:"Personal space", noise:"Noise tolerance",
    food:"Food preferences", location:"Location"
  };
  const ranked = Object.entries(scores).sort((x,y)=>y[1]-x[1]);
  const strengths = ranked.slice(0,3).map(([k,v])=>`${labels[k]} (${v}% compatibility)`);
  const conflicts = ranked.slice(-2).filter(([,v])=>v<80).map(([k])=>labels[k]);
  return {score, scores, strengths, conflicts, hardConflicts, eligible:hardConflicts.length===0};
}

export function explainMatch(result, person) {
  const strengths = result.strengths.slice(0,2).join(" and ").toLowerCase();
  const conflict = result.conflicts.length ? ` You may want to discuss ${result.conflicts.join(" and ").toLowerCase()} before moving in.` : " Your lifestyle preferences look well aligned.";
  return `${person.name} could be a promising flatmate: you align particularly well on ${strengths}.${conflict}`;
}