import skills from "../../data/skill_gems.json" with { type: "json" };

const seen = new Set();
const duplicates = [];

for (const skill of Object.values(skills)) {
  const name = skill.base_item?.display_name;

  if (name) {
    if (seen.has(name)) {
      duplicates.push(name);
    } else {
      seen.add(name);
    }
  }
}

if (duplicates.length > 0) {
  console.log("Duplicates found:", duplicates);
} else {
  console.log("No duplicates found");
}
