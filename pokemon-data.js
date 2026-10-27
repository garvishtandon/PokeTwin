// Kanto 151 Pokédex Database
const TYPE_COLORS = {
  Normal: '#a8a77a', Fire: '#ee8130', Water: '#6390f0', Electric: '#f7d02c',
  Grass: '#7ac74c', Ice: '#96d9d6', Fighting: '#c22e28', Poison: '#a33ea1',
  Ground: '#e2bf65', Flying: '#a98ff3', Psychic: '#f95587', Bug: '#a6b91a',
  Rock: '#b6a136', Ghost: '#735797', Dragon: '#6f35fc', Fairy: '#d685ad', Steel: '#b7b7ce'
};

const KANTO_POKEDEX = [
  {
    "id": 1,
    "name": "Bulbasaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      90,
      160,
      120
    ],
    "lore": "Calm, grounded, and connected to nature.",
    "nature": "Modest",
    "move": "Vine Whip"
  },
  {
    "id": 2,
    "name": "Ivysaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      80,
      150,
      130
    ],
    "lore": "Steadily growing, determined, and resilient.",
    "nature": "Hardy",
    "move": "Razor Leaf"
  },
  {
    "id": 3,
    "name": "Venusaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      70,
      140,
      120
    ],
    "lore": "Wise, deeply rooted, tranquil, and majestic.",
    "nature": "Quiet",
    "move": "Solar Beam"
  },
  {
    "id": 4,
    "name": "Charmander",
    "types": [
      "Fire"
    ],
    "c": [
      240,
      115,
      60
    ],
    "lore": "Spirited, adventurous, and full of inner fire.",
    "nature": "Brave",
    "move": "Ember"
  },
  {
    "id": 5,
    "name": "Charmeleon",
    "types": [
      "Fire"
    ],
    "c": [
      230,
      80,
      50
    ],
    "lore": "Feisty, competitive, and always eager to prove skill.",
    "nature": "Impish",
    "move": "Flamethrower"
  },
  {
    "id": 6,
    "name": "Charizard",
    "types": [
      "Fire",
      "Flying"
    ],
    "c": [
      235,
      120,
      50
    ],
    "lore": "Bold, dominant, charismatic, and fiercely loyal.",
    "nature": "Adamant",
    "move": "Fire Blast"
  },
  {
    "id": 7,
    "name": "Squirtle",
    "types": [
      "Water"
    ],
    "c": [
      85,
      170,
      220
    ],
    "lore": "Cool-headed, friendly, adaptable, and loyal.",
    "nature": "Relaxed",
    "move": "Water Gun"
  },
  {
    "id": 8,
    "name": "Wartortle",
    "types": [
      "Water"
    ],
    "c": [
      75,
      140,
      200
    ],
    "lore": "Tenacious, alert, and proud of earned wisdom.",
    "nature": "Calm",
    "move": "Aqua Tail"
  },
  {
    "id": 9,
    "name": "Blastoise",
    "types": [
      "Water"
    ],
    "c": [
      70,
      110,
      170
    ],
    "lore": "Protective, solid, dependable, and powerhouse leader.",
    "nature": "Bold",
    "move": "Hydro Pump"
  },
  {
    "id": 10,
    "name": "Caterpie",
    "types": [
      "Bug"
    ],
    "c": [
      130,
      180,
      80
    ],
    "lore": "Curious, humble, and full of quiet potential.",
    "nature": "Timid",
    "move": "String Shot"
  },
  {
    "id": 11,
    "name": "Metapod",
    "types": [
      "Bug"
    ],
    "c": [
      110,
      160,
      70
    ],
    "lore": "Patient, introspective, and building fortitude.",
    "nature": "Careful",
    "move": "Harden"
  },
  {
    "id": 12,
    "name": "Butterfree",
    "types": [
      "Bug",
      "Flying"
    ],
    "c": [
      180,
      180,
      220
    ],
    "lore": "Gentle, graceful, uplifting, and free-spirited.",
    "nature": "Gentle",
    "move": "Sleep Powder"
  },
  {
    "id": 13,
    "name": "Weedle",
    "types": [
      "Bug",
      "Poison"
    ],
    "c": [
      190,
      160,
      90
    ],
    "lore": "Pragmatic, cautious, and sharp-witted.",
    "nature": "Hasty",
    "move": "Poison Sting"
  },
  {
    "id": 14,
    "name": "Kakuna",
    "types": [
      "Bug",
      "Poison"
    ],
    "c": [
      210,
      180,
      80
    ],
    "lore": "Steadfast, protective, and composed under pressure.",
    "nature": "Docile",
    "move": "Iron Defense"
  },
  {
    "id": 15,
    "name": "Beedrill",
    "types": [
      "Bug",
      "Poison"
    ],
    "c": [
      220,
      190,
      50
    ],
    "lore": "Decisive, hyper-focused, and swift in action.",
    "nature": "Jolly",
    "move": "Twineedle"
  },
  {
    "id": 16,
    "name": "Pidgey",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      180,
      150,
      120
    ],
    "lore": "Reliable, peaceful, and observant of surroundings.",
    "nature": "Timid",
    "move": "Gust"
  },
  {
    "id": 17,
    "name": "Pidgeotto",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      190,
      140,
      100
    ],
    "lore": "Vigilant, protective, and proud scout.",
    "nature": "Naive",
    "move": "Wing Attack"
  },
  {
    "id": 18,
    "name": "Pidgeot",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      200,
      160,
      110
    ],
    "lore": "Noble, soaring, regal, and swift beyond measure.",
    "nature": "Lonely",
    "move": "Hurricane"
  },
  {
    "id": 19,
    "name": "Rattata",
    "types": [
      "Normal"
    ],
    "c": [
      160,
      120,
      180
    ],
    "lore": "Resourceful, quick on your feet, and survivor grit.",
    "nature": "Quirky",
    "move": "Quick Attack"
  },
  {
    "id": 20,
    "name": "Raticate",
    "types": [
      "Normal"
    ],
    "c": [
      170,
      130,
      90
    ],
    "lore": "Tough, fearless, tenacious, and fiercely guarded.",
    "nature": "Naughty",
    "move": "Hyper Fang"
  },
  {
    "id": 21,
    "name": "Spearow",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      170,
      100,
      70
    ],
    "lore": "Feisty, loud, territorial, and sharp-eyed.",
    "nature": "Rash",
    "move": "Peck"
  },
  {
    "id": 22,
    "name": "Fearow",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      160,
      110,
      80
    ],
    "lore": "Enduring, intimidating, and master of wide expanses.",
    "nature": "Brave",
    "move": "Drill Peck"
  },
  {
    "id": 23,
    "name": "Ekans",
    "types": [
      "Poison"
    ],
    "c": [
      140,
      80,
      170
    ],
    "lore": "Stealthy, patient, observant, and enigmatic.",
    "nature": "Sassy",
    "move": "Poison Sting"
  },
  {
    "id": 24,
    "name": "Arbok",
    "types": [
      "Poison"
    ],
    "c": [
      130,
      70,
      160
    ],
    "lore": "Intimidating presence, coiled power, and calculating.",
    "nature": "Careful",
    "move": "Glare"
  },
  {
    "id": 25,
    "name": "Pikachu",
    "types": [
      "Electric"
    ],
    "c": [
      245,
      210,
      50
    ],
    "lore": "Bright, sparkling energy, playful, and deeply loyal.",
    "nature": "Jolly",
    "move": "Volt Tackle"
  },
  {
    "id": 26,
    "name": "Raichu",
    "types": [
      "Electric"
    ],
    "c": [
      230,
      140,
      40
    ],
    "lore": "Confident, radiant powerhouse with cozy charm.",
    "nature": "Hasty",
    "move": "Thunderbolt"
  },
  {
    "id": 27,
    "name": "Sandshrew",
    "types": [
      "Ground"
    ],
    "c": [
      220,
      190,
      100
    ],
    "lore": "Cautious, neat, shy, and surprisingly resilient.",
    "nature": "Impish",
    "move": "Defense Curl"
  },
  {
    "id": 28,
    "name": "Sandslash",
    "types": [
      "Ground"
    ],
    "c": [
      200,
      170,
      90
    ],
    "lore": "Rugged, agile, sharp, and self-reliant.",
    "nature": "Adamant",
    "move": "Slash"
  },
  {
    "id": 29,
    "name": "Nidoran\u2640",
    "types": [
      "Poison"
    ],
    "c": [
      140,
      180,
      220
    ],
    "lore": "Gentle, modest, and protective of family circle.",
    "nature": "Docile",
    "move": "Double Kick"
  },
  {
    "id": 30,
    "name": "Nidorina",
    "types": [
      "Poison"
    ],
    "c": [
      130,
      170,
      210
    ],
    "lore": "Calm, nurturing, and steady emotional anchor.",
    "nature": "Relaxed",
    "move": "Bite"
  },
  {
    "id": 31,
    "name": "Nidoqueen",
    "types": [
      "Poison",
      "Ground"
    ],
    "c": [
      100,
      150,
      190
    ],
    "lore": "Fiercely protective matriarch with unbreakable heart.",
    "nature": "Bold",
    "move": "Earth Power"
  },
  {
    "id": 32,
    "name": "Nidoran\u2642",
    "types": [
      "Poison"
    ],
    "c": [
      170,
      110,
      190
    ],
    "lore": "Alert, sensitive ears, and brave beyond size.",
    "nature": "Brave",
    "move": "Horn Attack"
  },
  {
    "id": 33,
    "name": "Nidorino",
    "types": [
      "Poison"
    ],
    "c": [
      180,
      100,
      200
    ],
    "lore": "Quick-tempered, bold challenger, and energetic.",
    "nature": "Naughty",
    "move": "Fury Attack"
  },
  {
    "id": 34,
    "name": "Nidoking",
    "types": [
      "Poison",
      "Ground"
    ],
    "c": [
      150,
      80,
      180
    ],
    "lore": "Formidable, mighty, unyielding, and natural leader.",
    "nature": "Adamant",
    "move": "Earthquake"
  },
  {
    "id": 35,
    "name": "Clefairy",
    "types": [
      "Fairy"
    ],
    "c": [
      245,
      190,
      210
    ],
    "lore": "Whimsical, celestial dreamer with magnetic sweetness.",
    "nature": "Timid",
    "move": "Metronome"
  },
  {
    "id": 36,
    "name": "Clefable",
    "types": [
      "Fairy"
    ],
    "c": [
      240,
      180,
      200
    ],
    "lore": "Enchanting, elusive, serene, and otherworldly.",
    "nature": "Calm",
    "move": "Moonblast"
  },
  {
    "id": 37,
    "name": "Vulpix",
    "types": [
      "Fire"
    ],
    "c": [
      225,
      110,
      70
    ],
    "lore": "Graceful, warm, charming, and subtly clever.",
    "nature": "Naive",
    "move": "Will-O-Wisp"
  },
  {
    "id": 38,
    "name": "Ninetales",
    "types": [
      "Fire"
    ],
    "c": [
      245,
      235,
      170
    ],
    "lore": "Mystic, elegant, legendary poise, and ancient grace.",
    "nature": "Modest",
    "move": "Flamethrower"
  },
  {
    "id": 39,
    "name": "Jigglypuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "c": [
      245,
      175,
      205
    ],
    "lore": "Sweet, vocal, expressive, and demands attention.",
    "nature": "Jolly",
    "move": "Sing"
  },
  {
    "id": 40,
    "name": "Wigglytuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "c": [
      240,
      180,
      210
    ],
    "lore": "Puffy comfort, bighearted hugs, and theatrical vibe.",
    "nature": "Careful",
    "move": "Hyper Voice"
  },
  {
    "id": 41,
    "name": "Zubat",
    "types": [
      "Poison",
      "Flying"
    ],
    "c": [
      80,
      100,
      170
    ],
    "lore": "Nocturnal wanderer, intuitive echo locator.",
    "nature": "Rash",
    "move": "Supersonic"
  },
  {
    "id": 42,
    "name": "Golbat",
    "types": [
      "Poison",
      "Flying"
    ],
    "c": [
      70,
      90,
      160
    ],
    "lore": "Hungry for life, relentless, and fearless flyer.",
    "nature": "Hasty",
    "move": "Air Cutter"
  },
  {
    "id": 43,
    "name": "Oddish",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      70,
      100,
      160
    ],
    "lore": "Night owl, rooted in quiet peace, blooming in dark.",
    "nature": "Quiet",
    "move": "Absorb"
  },
  {
    "id": 44,
    "name": "Gloom",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      100,
      120,
      150
    ],
    "lore": "Unapologetically weird, funky, and authentic.",
    "nature": "Relaxed",
    "move": "Mega Drain"
  },
  {
    "id": 45,
    "name": "Vileplume",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      180,
      60,
      60
    ],
    "lore": "Vibrant petal splash, showstopping bold charisma.",
    "nature": "Modest",
    "move": "Petal Dance"
  },
  {
    "id": 46,
    "name": "Paras",
    "types": [
      "Bug",
      "Grass"
    ],
    "c": [
      225,
      100,
      50
    ],
    "lore": "Curious symbiotic soul sharing warmth with nature.",
    "nature": "Docile",
    "move": "Spore"
  },
  {
    "id": 47,
    "name": "Parasect",
    "types": [
      "Bug",
      "Grass"
    ],
    "c": [
      210,
      80,
      50
    ],
    "lore": "Fascinating, trance-like focus, guided by higher calls.",
    "nature": "Quiet",
    "move": "X-Scissor"
  },
  {
    "id": 48,
    "name": "Venonat",
    "types": [
      "Bug",
      "Poison"
    ],
    "c": [
      130,
      90,
      140
    ],
    "lore": "Fluffy radar eyes, receptive to every ambient frequency.",
    "nature": "Timid",
    "move": "Psybeam"
  },
  {
    "id": 49,
    "name": "Venomoth",
    "types": [
      "Bug",
      "Poison"
    ],
    "c": [
      180,
      160,
      210
    ],
    "lore": "Mystical night fluttering with iridescent allure.",
    "nature": "Gentle",
    "move": "Bug Buzz"
  },
  {
    "id": 50,
    "name": "Diglett",
    "types": [
      "Ground"
    ],
    "c": [
      145,
      95,
      65
    ],
    "lore": "Down-to-earth, stealthy, and popping up unexpectedly.",
    "nature": "Jolly",
    "move": "Mud-Slap"
  },
  {
    "id": 51,
    "name": "Dugtrio",
    "types": [
      "Ground"
    ],
    "c": [
      140,
      90,
      60
    ],
    "lore": "Team-oriented, cohesive harmony, seismic teamwork.",
    "nature": "Adamant",
    "move": "Earthquake"
  },
  {
    "id": 52,
    "name": "Meowth",
    "types": [
      "Normal"
    ],
    "c": [
      245,
      230,
      180
    ],
    "lore": "Sassy, gold-seeking, quick-tongued, and streetwise.",
    "nature": "Quirky",
    "move": "Pay Day"
  },
  {
    "id": 53,
    "name": "Persian",
    "types": [
      "Normal"
    ],
    "c": [
      245,
      240,
      200
    ],
    "lore": "Sleek, aristocratic, poised, and dangerously graceful.",
    "nature": "Hasty",
    "move": "Slash"
  },
  {
    "id": 54,
    "name": "Psyduck",
    "types": [
      "Water"
    ],
    "c": [
      245,
      210,
      80
    ],
    "lore": "Quirky, deep-thinking, unpredictable, and hilarious.",
    "nature": "Mild",
    "move": "Confusion"
  },
  {
    "id": 55,
    "name": "Golduck",
    "types": [
      "Water"
    ],
    "c": [
      70,
      140,
      210
    ],
    "lore": "Focused, athletic, psychic calmness, and clarity.",
    "nature": "Modest",
    "move": "Hydro Pump"
  },
  {
    "id": 56,
    "name": "Mankey",
    "types": [
      "Fighting"
    ],
    "c": [
      230,
      210,
      180
    ],
    "lore": "Pure adrenaline, fiery temper, and unfiltered honesty.",
    "nature": "Rash",
    "move": "Karate Chop"
  },
  {
    "id": 57,
    "name": "Primeape",
    "types": [
      "Fighting"
    ],
    "c": [
      215,
      185,
      160
    ],
    "lore": "Relentless grit, channelled rage, never backing down.",
    "nature": "Adamant",
    "move": "Cross Chop"
  },
  {
    "id": 58,
    "name": "Growlithe",
    "types": [
      "Fire"
    ],
    "c": [
      235,
      130,
      60
    ],
    "lore": "Loyal pup, brave protector, and wholehearted friend.",
    "nature": "Brave",
    "move": "Flame Wheel"
  },
  {
    "id": 59,
    "name": "Arcanine",
    "types": [
      "Fire"
    ],
    "c": [
      230,
      120,
      50
    ],
    "lore": "Majestic, legendary presence, fiery courage, and noble.",
    "nature": "Hardy",
    "move": "Extreme Speed"
  },
  {
    "id": 60,
    "name": "Poliwag",
    "types": [
      "Water"
    ],
    "c": [
      90,
      150,
      220
    ],
    "lore": "Fresh swimmer, sweet swirl of curiosity, and fluid.",
    "nature": "Docile",
    "move": "Bubble Beam"
  },
  {
    "id": 61,
    "name": "Poliwhirl",
    "types": [
      "Water"
    ],
    "c": [
      70,
      120,
      200
    ],
    "lore": "Agile, balanced, always ready for action and fun.",
    "nature": "Jolly",
    "move": "Hypnosis"
  },
  {
    "id": 62,
    "name": "Poliwrath",
    "types": [
      "Water",
      "Fighting"
    ],
    "c": [
      60,
      100,
      180
    ],
    "lore": "Iron endurance, powerhouse swimmer, muscular discipline.",
    "nature": "Adamant",
    "move": "Submission"
  },
  {
    "id": 63,
    "name": "Abra",
    "types": [
      "Psychic"
    ],
    "c": [
      230,
      190,
      80
    ],
    "lore": "Teleporting away from drama, sleeping 18 hours daily.",
    "nature": "Quiet",
    "move": "Teleport"
  },
  {
    "id": 64,
    "name": "Kadabra",
    "types": [
      "Psychic"
    ],
    "c": [
      225,
      180,
      70
    ],
    "lore": "Telekinetic focus, spoon-bending genius, and mystique.",
    "nature": "Modest",
    "move": "Psybeam"
  },
  {
    "id": 65,
    "name": "Alakazam",
    "types": [
      "Psychic"
    ],
    "c": [
      220,
      175,
      60
    ],
    "lore": "5,000 IQ master strategist, calculating and enlightened.",
    "nature": "Modest",
    "move": "Psychic"
  },
  {
    "id": 66,
    "name": "Machop",
    "types": [
      "Fighting"
    ],
    "c": [
      130,
      150,
      160
    ],
    "lore": "Daily workout enthusiast, lifting spirits and weights.",
    "nature": "Adamant",
    "move": "Low Kick"
  },
  {
    "id": 67,
    "name": "Machoke",
    "types": [
      "Fighting"
    ],
    "c": [
      120,
      140,
      150
    ],
    "lore": "Muscular confidence, belt of restraint, boundless power.",
    "nature": "Brave",
    "move": "Vital Throw"
  },
  {
    "id": 68,
    "name": "Machamp",
    "types": [
      "Fighting"
    ],
    "c": [
      115,
      135,
      145
    ],
    "lore": "Four arms of unstoppable momentum and ultimate strength.",
    "nature": "Hardy",
    "move": "Dynamic Punch"
  },
  {
    "id": 69,
    "name": "Bellsprout",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      220,
      220,
      90
    ],
    "lore": "Flexible, swaying with life winds, surprisingly snappy.",
    "nature": "Naive",
    "move": "Vine Whip"
  },
  {
    "id": 70,
    "name": "Weepinbell",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      215,
      210,
      80
    ],
    "lore": "Hungry explorer, hooked on discoveries and sweet nectar.",
    "nature": "Impish",
    "move": "Razor Leaf"
  },
  {
    "id": 71,
    "name": "Victreebel",
    "types": [
      "Grass",
      "Poison"
    ],
    "c": [
      180,
      200,
      70
    ],
    "lore": "Jungle ambush charisma, alluring and commanding.",
    "nature": "Rash",
    "move": "Leaf Storm"
  },
  {
    "id": 72,
    "name": "Tentacool",
    "types": [
      "Water",
      "Poison"
    ],
    "c": [
      80,
      150,
      190
    ],
    "lore": "Glassy drifter, crystal clear, subtle stinging sting.",
    "nature": "Timid",
    "move": "Acid"
  },
  {
    "id": 73,
    "name": "Tentacruel",
    "types": [
      "Water",
      "Poison"
    ],
    "c": [
      60,
      120,
      170
    ],
    "lore": "King of sea depths, 80 tentacles of absolute order.",
    "nature": "Bold",
    "move": "Hydro Pump"
  },
  {
    "id": 74,
    "name": "Geodude",
    "types": [
      "Rock",
      "Ground"
    ],
    "c": [
      140,
      130,
      120
    ],
    "lore": "Rock solid friend, durable, and ready to roll.",
    "nature": "Hardy",
    "move": "Rock Throw"
  },
  {
    "id": 75,
    "name": "Graveler",
    "types": [
      "Rock",
      "Ground"
    ],
    "c": [
      150,
      135,
      110
    ],
    "lore": "Unstoppable boulder rolling through any obstacle.",
    "nature": "Impish",
    "move": "Rollout"
  },
  {
    "id": 76,
    "name": "Golem",
    "types": [
      "Rock",
      "Ground"
    ],
    "c": [
      160,
      140,
      100
    ],
    "lore": "Impenetrable armor, explosive power, and heavy gravitas.",
    "nature": "Brave",
    "move": "Stone Edge"
  },
  {
    "id": 77,
    "name": "Ponyta",
    "types": [
      "Fire"
    ],
    "c": [
      245,
      235,
      180
    ],
    "lore": "Spirited galloper, mane of pure flame, and boundless joy.",
    "nature": "Jolly",
    "move": "Flame Charge"
  },
  {
    "id": 78,
    "name": "Rapidash",
    "types": [
      "Fire"
    ],
    "c": [
      250,
      240,
      200
    ],
    "lore": "Blazing speed, galloping across the horizon fearlessly.",
    "nature": "Hasty",
    "move": "Flare Blitz"
  },
  {
    "id": 79,
    "name": "Slowpoke",
    "types": [
      "Water",
      "Psychic"
    ],
    "c": [
      240,
      150,
      170
    ],
    "lore": "Master of relaxation, reacting tomorrow to today's news.",
    "nature": "Relaxed",
    "move": "Yawn"
  },
  {
    "id": 80,
    "name": "Slowbro",
    "types": [
      "Water",
      "Psychic"
    ],
    "c": [
      230,
      140,
      160
    ],
    "lore": "Cozy coexistence, untroubled by hustle culture.",
    "nature": "Careful",
    "move": "Slack Off"
  },
  {
    "id": 81,
    "name": "Magnemite",
    "types": [
      "Electric",
      "Steel"
    ],
    "c": [
      160,
      170,
      180
    ],
    "lore": "Electromagnetic pull, anti-gravity innovator.",
    "nature": "Quirky",
    "move": "Thunder Shock"
  },
  {
    "id": 82,
    "name": "Magneton",
    "types": [
      "Electric",
      "Steel"
    ],
    "c": [
      150,
      160,
      175
    ],
    "lore": "Triad resonance, high-voltage synergy, and precision.",
    "nature": "Modest",
    "move": "Zap Cannon"
  },
  {
    "id": 83,
    "name": "Farfetch'd",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      160,
      120,
      90
    ],
    "lore": "Walking with your own leek, distinctive and brave.",
    "nature": "Adamant",
    "move": "Slash"
  },
  {
    "id": 84,
    "name": "Doduo",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      180,
      140,
      100
    ],
    "lore": "Dual brainstormer, sprinting past limits with speed.",
    "nature": "Jolly",
    "move": "Tri Attack"
  },
  {
    "id": 85,
    "name": "Dodrio",
    "types": [
      "Normal",
      "Flying"
    ],
    "c": [
      170,
      130,
      90
    ],
    "lore": "Joy, sorrow, and anger in perfect synchronized stride.",
    "nature": "Hasty",
    "move": "Drill Peck"
  },
  {
    "id": 86,
    "name": "Seel",
    "types": [
      "Water"
    ],
    "c": [
      235,
      240,
      245
    ],
    "lore": "Pure icy white, swimming in arctic joy, cute horn.",
    "nature": "Docile",
    "move": "Aurora Beam"
  },
  {
    "id": 87,
    "name": "Dewgong",
    "types": [
      "Water",
      "Ice"
    ],
    "c": [
      225,
      235,
      245
    ],
    "lore": "Graceful ice ballerina, sleek thermal serenity.",
    "nature": "Calm",
    "move": "Ice Beam"
  },
  {
    "id": 88,
    "name": "Grimer",
    "types": [
      "Poison"
    ],
    "c": [
      140,
      90,
      150
    ],
    "lore": "Adaptable survivor, messy room energy, finding treasure.",
    "nature": "Naughty",
    "move": "Sludge"
  },
  {
    "id": 89,
    "name": "Muk",
    "types": [
      "Poison"
    ],
    "c": [
      130,
      75,
      140
    ],
    "lore": "Toxic swagger, embracing chaos with a big grin.",
    "nature": "Bold",
    "move": "Sludge Wave"
  },
  {
    "id": 90,
    "name": "Shellder",
    "types": [
      "Water"
    ],
    "c": [
      140,
      100,
      160
    ],
    "lore": "Tongue out, shell locked tight, quirky seashore scout.",
    "nature": "Timid",
    "move": "Clamp"
  },
  {
    "id": 91,
    "name": "Cloyster",
    "types": [
      "Water",
      "Ice"
    ],
    "c": [
      130,
      90,
      150
    ],
    "lore": "Impenetrable spike shield, frosty defensive genius.",
    "nature": "Impish",
    "move": "Spike Cannon"
  },
  {
    "id": 92,
    "name": "Gastly",
    "types": [
      "Ghost",
      "Poison"
    ],
    "c": [
      100,
      70,
      130
    ],
    "lore": "Gaseous phantom, vaporous laugh, spooky prankster.",
    "nature": "Timid",
    "move": "Lick"
  },
  {
    "id": 93,
    "name": "Haunter",
    "types": [
      "Ghost",
      "Poison"
    ],
    "c": [
      110,
      65,
      140
    ],
    "lore": "Detached floating hands, mischievous grin, midnight fun.",
    "nature": "Jolly",
    "move": "Shadow Punch"
  },
  {
    "id": 94,
    "name": "Gengar",
    "types": [
      "Ghost",
      "Poison"
    ],
    "c": [
      115,
      60,
      135
    ],
    "lore": "Shadow king, wicked humor, loyal protector in darkness.",
    "nature": "Timid",
    "move": "Shadow Ball"
  },
  {
    "id": 95,
    "name": "Onix",
    "types": [
      "Rock",
      "Ground"
    ],
    "c": [
      140,
      140,
      145
    ],
    "lore": "Colossal rock snake, magnetic compass of the underground.",
    "nature": "Brave",
    "move": "Rock Slide"
  },
  {
    "id": 96,
    "name": "Drowzee",
    "types": [
      "Psychic"
    ],
    "c": [
      210,
      180,
      80
    ],
    "lore": "Dream gourmand, hypnotic swinging pendulum charm.",
    "nature": "Quiet",
    "move": "Hypnosis"
  },
  {
    "id": 97,
    "name": "Hypno",
    "types": [
      "Psychic"
    ],
    "c": [
      220,
      190,
      60
    ],
    "lore": "Mesmerizing focus, subconscious guide, tranquil spell.",
    "nature": "Calm",
    "move": "Dream Eater"
  },
  {
    "id": 98,
    "name": "Krabby",
    "types": [
      "Water"
    ],
    "c": [
      235,
      110,
      70
    ],
    "lore": "Sidewalking beach champ, pincers ready for high fives.",
    "nature": "Impish",
    "move": "Crabhammer"
  },
  {
    "id": 99,
    "name": "Kingler",
    "types": [
      "Water"
    ],
    "c": [
      230,
      90,
      60
    ],
    "lore": "Colossal pincer power, oceanic champion, crushing waves.",
    "nature": "Adamant",
    "move": "Guillotine"
  },
  {
    "id": 100,
    "name": "Voltorb",
    "types": [
      "Electric"
    ],
    "c": [
      220,
      60,
      50
    ],
    "lore": "Short fuse, electric spark plug, rolling with energy.",
    "nature": "Hasty",
    "move": "Spark"
  },
  {
    "id": 101,
    "name": "Electrode",
    "types": [
      "Electric"
    ],
    "c": [
      230,
      220,
      220
    ],
    "lore": "Speed demon, explosive smile, fastest sphere alive.",
    "nature": "Timid",
    "move": "Explosion"
  },
  {
    "id": 102,
    "name": "Exeggcute",
    "types": [
      "Grass",
      "Psychic"
    ],
    "c": [
      240,
      200,
      180
    ],
    "lore": "Telepathic hivemind group chat, never traveling alone.",
    "nature": "Docile",
    "move": "Barrage"
  },
  {
    "id": 103,
    "name": "Exeggutor",
    "types": [
      "Grass",
      "Psychic"
    ],
    "c": [
      210,
      170,
      80
    ],
    "lore": "Tropical holiday vibes, three laughing heads, sunny joy.",
    "nature": "Relaxed",
    "move": "Egg Bomb"
  },
  {
    "id": 104,
    "name": "Cubone",
    "types": [
      "Ground"
    ],
    "c": [
      170,
      130,
      90
    ],
    "lore": "Tender-hearted lone wolf, turning pain into courage.",
    "nature": "Lonely",
    "move": "Bone Club"
  },
  {
    "id": 105,
    "name": "Marowak",
    "types": [
      "Ground"
    ],
    "c": [
      160,
      120,
      80
    ],
    "lore": "Hardened warrior, bone boomerang master, stoic shield.",
    "nature": "Brave",
    "move": "Bonemerang"
  },
  {
    "id": 106,
    "name": "Hitmonlee",
    "types": [
      "Fighting"
    ],
    "c": [
      170,
      120,
      90
    ],
    "lore": "Spring-loaded kicks, extreme flexibility, laser focus.",
    "nature": "Adamant",
    "move": "High Jump Kick"
  },
  {
    "id": 107,
    "name": "Hitmonchan",
    "types": [
      "Fighting"
    ],
    "c": [
      190,
      140,
      120
    ],
    "lore": "Lightning jab boxer, champion determination, iron will.",
    "nature": "Jolly",
    "move": "Mach Punch"
  },
  {
    "id": 108,
    "name": "Lickitung",
    "types": [
      "Normal"
    ],
    "c": [
      240,
      150,
      170
    ],
    "lore": "Taste-testing every moment of life, expressive tongue.",
    "nature": "Quirky",
    "move": "Slam"
  },
  {
    "id": 109,
    "name": "Koffing",
    "types": [
      "Poison"
    ],
    "c": [
      130,
      110,
      160
    ],
    "lore": "Floating purple smoke cloud with a goofy, cheerful smile.",
    "nature": "Relaxed",
    "move": "Smokescreen"
  },
  {
    "id": 110,
    "name": "Weezing",
    "types": [
      "Poison"
    ],
    "c": [
      120,
      95,
      150
    ],
    "lore": "Double chimney harmony, thriving where others falter.",
    "nature": "Careful",
    "move": "Sludge Bomb"
  },
  {
    "id": 111,
    "name": "Rhyhorn",
    "types": [
      "Ground",
      "Rock"
    ],
    "c": [
      130,
      135,
      140
    ],
    "lore": "Straightforward charging momentum, single-track mind.",
    "nature": "Brave",
    "move": "Horn Drill"
  },
  {
    "id": 112,
    "name": "Rhydon",
    "types": [
      "Ground",
      "Rock"
    ],
    "c": [
      125,
      130,
      135
    ],
    "lore": "Armor-plated trailblazer, drill horn carving mountains.",
    "nature": "Adamant",
    "move": "Megahorn"
  },
  {
    "id": 113,
    "name": "Chansey",
    "types": [
      "Normal"
    ],
    "c": [
      245,
      180,
      200
    ],
    "lore": "Doctor of optimism, sharing eggs of pure happiness.",
    "nature": "Gentle",
    "move": "Soft-Boiled"
  },
  {
    "id": 114,
    "name": "Tangela",
    "types": [
      "Grass"
    ],
    "c": [
      70,
      100,
      170
    ],
    "lore": "Blue tangled mystery, red running boots, playful aura.",
    "nature": "Quiet",
    "move": "Giga Drain"
  },
  {
    "id": 115,
    "name": "Kangaskhan",
    "types": [
      "Normal"
    ],
    "c": [
      150,
      120,
      90
    ],
    "lore": "Parental guardian instincts, fierce love, boundless warmth.",
    "nature": "Bold",
    "move": "Dizzy Punch"
  },
  {
    "id": 116,
    "name": "Horsea",
    "types": [
      "Water"
    ],
    "c": [
      90,
      170,
      210
    ],
    "lore": "Cute coral dancer, shooting ink spirals with style.",
    "nature": "Timid",
    "move": "Bubble"
  },
  {
    "id": 117,
    "name": "Seadra",
    "types": [
      "Water"
    ],
    "c": [
      80,
      150,
      200
    ],
    "lore": "Spiny sharp swimmer, whirlpool creator, edgy elegance.",
    "nature": "Modest",
    "move": "Hydro Pump"
  },
  {
    "id": 118,
    "name": "Goldeen",
    "types": [
      "Water"
    ],
    "c": [
      240,
      160,
      130
    ],
    "lore": "Water dancer, graceful fin flutter, aquatic elegance.",
    "nature": "Gentle",
    "move": "Water Pulse"
  },
  {
    "id": 119,
    "name": "Seaking",
    "types": [
      "Water"
    ],
    "c": [
      235,
      140,
      100
    ],
    "lore": "Autumn waterfall champion, proud horn and vibrant scales.",
    "nature": "Brave",
    "move": "Waterfall"
  },
  {
    "id": 120,
    "name": "Staryu",
    "types": [
      "Water"
    ],
    "c": [
      180,
      120,
      60
    ],
    "lore": "Starry sea jewel, glowing red core pulsing with signals.",
    "nature": "Docile",
    "move": "Swift"
  },
  {
    "id": 121,
    "name": "Starmie",
    "types": [
      "Water",
      "Psychic"
    ],
    "c": [
      120,
      80,
      160
    ],
    "lore": "Cosmic geometric perfection, core glowing in rainbow hues.",
    "nature": "Timid",
    "move": "Cosmic Power"
  },
  {
    "id": 122,
    "name": "Mr. Mime",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "c": [
      240,
      160,
      180
    ],
    "lore": "Master pantomime, building invisible walls with charm.",
    "nature": "Quirky",
    "move": "Barrier"
  },
  {
    "id": 123,
    "name": "Scyther",
    "types": [
      "Bug",
      "Flying"
    ],
    "c": [
      100,
      180,
      80
    ],
    "lore": "Ninja mantis speed, scythe blades cutting the wind.",
    "nature": "Jolly",
    "move": "X-Scissor"
  },
  {
    "id": 124,
    "name": "Jynx",
    "types": [
      "Ice",
      "Psychic"
    ],
    "c": [
      180,
      60,
      80
    ],
    "lore": "Rhythmic swaying diva, hypnotic dance, frozen kisses.",
    "nature": "Mild",
    "move": "Blizzard"
  },
  {
    "id": 125,
    "name": "Electabuzz",
    "types": [
      "Electric"
    ],
    "c": [
      240,
      190,
      40
    ],
    "lore": "Windmill punching thunder generator, pure current.",
    "nature": "Hasty",
    "move": "Thunder Punch"
  },
  {
    "id": 126,
    "name": "Magmar",
    "types": [
      "Fire"
    ],
    "c": [
      235,
      80,
      40
    ],
    "lore": "Living magma volcano, fiery breath, orange heatwave.",
    "nature": "Rash",
    "move": "Fire Blast"
  },
  {
    "id": 127,
    "name": "Pinsir",
    "types": [
      "Bug"
    ],
    "c": [
      150,
      110,
      80
    ],
    "lore": "Grip of titanium, forest gladiator, unrelenting grit.",
    "nature": "Adamant",
    "move": "Vice Grip"
  },
  {
    "id": 128,
    "name": "Tauros",
    "types": [
      "Normal"
    ],
    "c": [
      160,
      100,
      60
    ],
    "lore": "Triple-tailed charging bull, boundless wild horsepower.",
    "nature": "Brave",
    "move": "Take Down"
  },
  {
    "id": 129,
    "name": "Magikarp",
    "types": [
      "Water"
    ],
    "c": [
      235,
      90,
      60
    ],
    "lore": "Underdog of all underdogs, splashing today, dragon tomorrow.",
    "nature": "Quirky",
    "move": "Splash"
  },
  {
    "id": 130,
    "name": "Gyarados",
    "types": [
      "Water",
      "Flying"
    ],
    "c": [
      70,
      120,
      200
    ],
    "lore": "Epic turnaround story, untamed storm of pure wrath.",
    "nature": "Adamant",
    "move": "Hyper Beam"
  },
  {
    "id": 131,
    "name": "Lapras",
    "types": [
      "Water",
      "Ice"
    ],
    "c": [
      90,
      150,
      210
    ],
    "lore": "Gentle ferry of the seas, singing melancholic melodies.",
    "nature": "Calm",
    "move": "Surf"
  },
  {
    "id": 132,
    "name": "Ditto",
    "types": [
      "Normal"
    ],
    "c": [
      180,
      130,
      190
    ],
    "lore": "Maximum adaptability, shapeshifter who fits everywhere.",
    "nature": "Quirky",
    "move": "Transform"
  },
  {
    "id": 133,
    "name": "Eevee",
    "types": [
      "Normal"
    ],
    "c": [
      170,
      125,
      85
    ],
    "lore": "Infinite potential, friendly, curious, and beloved by all.",
    "nature": "Jolly",
    "move": "Swift"
  },
  {
    "id": 134,
    "name": "Vaporeon",
    "types": [
      "Water"
    ],
    "c": [
      80,
      160,
      210
    ],
    "lore": "Melt into water, serene tide swimmer, cool mermaid tail.",
    "nature": "Calm",
    "move": "Aqua Ring"
  },
  {
    "id": 135,
    "name": "Jolteon",
    "types": [
      "Electric"
    ],
    "c": [
      240,
      215,
      60
    ],
    "lore": "Pin-missile spikes, lightning reflex, high-strung spark.",
    "nature": "Hasty",
    "move": "Thunder"
  },
  {
    "id": 136,
    "name": "Flareon",
    "types": [
      "Fire"
    ],
    "c": [
      235,
      110,
      50
    ],
    "lore": "Coziest fluffy furnace, 1,600-degree warm hugs.",
    "nature": "Careful",
    "move": "Flamethrower"
  },
  {
    "id": 137,
    "name": "Porygon",
    "types": [
      "Normal"
    ],
    "c": [
      220,
      110,
      140
    ],
    "lore": "Digital pioneer, low-poly retro cyberspace wanderer.",
    "nature": "Modest",
    "move": "Conversion"
  },
  {
    "id": 138,
    "name": "Omanyte",
    "types": [
      "Rock",
      "Water"
    ],
    "c": [
      100,
      160,
      200
    ],
    "lore": "Ancient spiral shell, prehistoric curiosity floating calm.",
    "nature": "Docile",
    "move": "Ancient Power"
  },
  {
    "id": 139,
    "name": "Omastar",
    "types": [
      "Rock",
      "Water"
    ],
    "c": [
      90,
      140,
      190
    ],
    "lore": "Fossil predator revived, sharp beak, ancient champion.",
    "nature": "Quiet",
    "move": "Hydro Pump"
  },
  {
    "id": 140,
    "name": "Kabuto",
    "types": [
      "Rock",
      "Water"
    ],
    "c": [
      140,
      110,
      70
    ],
    "lore": "Prehistoric dome shield, glowing red eyes under sea floor.",
    "nature": "Hardy",
    "move": "Mega Drain"
  },
  {
    "id": 141,
    "name": "Kabutops",
    "types": [
      "Rock",
      "Water"
    ],
    "c": [
      130,
      95,
      65
    ],
    "lore": "Sleek prehistoric scythe master, supreme swift hunter.",
    "nature": "Adamant",
    "move": "Slash"
  },
  {
    "id": 142,
    "name": "Aerodactyl",
    "types": [
      "Rock",
      "Flying"
    ],
    "c": [
      170,
      160,
      180
    ],
    "lore": "Primal pterosaur skies ruler, ferocious prehistoric roar.",
    "nature": "Jolly",
    "move": "Ancient Power"
  },
  {
    "id": 143,
    "name": "Snorlax",
    "types": [
      "Normal"
    ],
    "c": [
      70,
      115,
      135
    ],
    "lore": "Ultimate zen snooze, blocking roads with unbothered peace.",
    "nature": "Relaxed",
    "move": "Rest"
  },
  {
    "id": 144,
    "name": "Articuno",
    "types": [
      "Ice",
      "Flying"
    ],
    "c": [
      140,
      200,
      240
    ],
    "lore": "Legendary blizzard bird, crystalline elegance and frost.",
    "nature": "Calm",
    "move": "Blizzard"
  },
  {
    "id": 145,
    "name": "Zapdos",
    "types": [
      "Electric",
      "Flying"
    ],
    "c": [
      245,
      200,
      40
    ],
    "lore": "Legendary lightning storm, crackling yellow voltage wings.",
    "nature": "Hasty",
    "move": "Thunder"
  },
  {
    "id": 146,
    "name": "Moltres",
    "types": [
      "Fire",
      "Flying"
    ],
    "c": [
      245,
      140,
      50
    ],
    "lore": "Legendary fire phoenix, igniting the dawn with scarlet glory.",
    "nature": "Brave",
    "move": "Sky Attack"
  },
  {
    "id": 147,
    "name": "Dratini",
    "types": [
      "Dragon"
    ],
    "c": [
      100,
      150,
      220
    ],
    "lore": "Pure mythic serpent, shedding scales of water calm.",
    "nature": "Gentle",
    "move": "Dragon Breath"
  },
  {
    "id": 148,
    "name": "Dragonair",
    "types": [
      "Dragon"
    ],
    "c": [
      90,
      140,
      220
    ],
    "lore": "Aura orb elegance, blessing weather wherever it glides.",
    "nature": "Modest",
    "move": "Dragon Pulse"
  },
  {
    "id": 149,
    "name": "Dragonite",
    "types": [
      "Dragon",
      "Flying"
    ],
    "c": [
      235,
      160,
      70
    ],
    "lore": "Gentle giant, flying across the globe to rescue ships.",
    "nature": "Careful",
    "move": "Outrage"
  },
  {
    "id": 150,
    "name": "Mewtwo",
    "types": [
      "Psychic"
    ],
    "c": [
      180,
      170,
      200
    ],
    "lore": "Philosophical prodigy, unmatched psychic power, seeking purpose.",
    "nature": "Timid",
    "move": "Psystrike"
  },
  {
    "id": 151,
    "name": "Mew",
    "types": [
      "Psychic"
    ],
    "c": [
      240,
      170,
      200
    ],
    "lore": "Ancestral DNA mystery, childlike innocence, pure joy.",
    "nature": "Quirky",
    "move": "Psychic"
  }
];