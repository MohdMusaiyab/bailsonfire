export const TEAM_DETAILS: Record<string, { fullName: string; color: string }> = {
  mi: { fullName: "Mumbai Indians", color: "#004BA0" },
  csk: { fullName: "Chennai Super Kings", color: "#C8A800" },
  rcb: { fullName: "Royal Challengers Bengaluru", color: "#CC1020" },
  kkr: { fullName: "Kolkata Knight Riders", color: "#552791" },
  dc: { fullName: "Delhi Capitals", color: "#0078BC" },
  srh: { fullName: "Sunrisers Hyderabad", color: "#D4881E" },
  rr: { fullName: "Rajasthan Royals", color: "#EA1A85" },
  pbks: { fullName: "Punjab Kings", color: "#C41020" },
  lsg: { fullName: "Lucknow Super Giants", color: "#3B82F6" },
  gt: { fullName: "Gujarat Titans", color: "#1C1C1C" },
  
  // Historical / Defunct Teams
  dec: { fullName: "Deccan Chargers", color: "#3B4A6B" }, 
  ktk: { fullName: "Kochi Tuskers Kerala", color: "#F7931E" }, 
  pwi: { fullName: "Pune Warriors India", color: "#2E3B4E" }, 
  gl: { fullName: "Gujarat Lions", color: "#E04F16" }, 
  rpsg: { fullName: "Rising Pune Supergiant", color: "#D11D9B" }, 
};

// Map each year to its active teams
export const SEASON_TEAMS: Record<number, string[]> = {
  2008: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "dec"],
  2009: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "dec"],
  2010: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "dec"],
  2011: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "dec", "ktk", "pwi"],
  2012: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "dec", "pwi"],
  2013: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh", "pwi"],
  2014: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh"],
  2015: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh"],
  2016: ["mi", "rcb", "kkr", "dc", "srh", "pbks", "gl", "rpsg"], // CSK & RR suspended
  2017: ["mi", "rcb", "kkr", "dc", "srh", "pbks", "gl", "rpsg"],
  2018: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh"], // CSK & RR return
  2019: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh"],
  2020: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh"],
  2021: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh"],
  2022: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh", "lsg", "gt"],
  2023: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh", "lsg", "gt"],
  2024: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh", "lsg", "gt"],
  2025: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh", "lsg", "gt"],
  2026: ["rr", "pbks", "csk", "dc", "mi", "rcb", "kkr", "srh", "lsg", "gt"],
};
