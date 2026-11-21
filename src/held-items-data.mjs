// 72 general-purpose held items across nine balanced families, plus two
// strategy-only orbs whose self-inflicted status needs an explicit ability.
// The item's in-game effect and the intentionally dry caption are separate.
// This is a playful analogy, not a clinical assessment or a battle simulation.
export const ITEM_FAMILIES = Object.freeze({
  "control": {
    "label": "Control & certainty",
    "insight": "precision and predictable outcomes",
    "ennea": [
      88,
      45,
      72,
      64,
      100,
      90,
      48,
      63,
      58
    ],
    "target": [
      68,
      84,
      35,
      35,
      42
    ]
  },
  "protection": {
    "label": "Protection & boundaries",
    "insight": "guardrails and self-protection",
    "ennea": [
      83,
      83,
      56,
      55,
      72,
      100,
      40,
      90,
      77
    ],
    "target": [
      42,
      78,
      34,
      56,
      57
    ]
  },
  "recovery": {
    "label": "Endurance & recovery",
    "insight": "steady restoration and sustainable effort",
    "ennea": [
      60,
      81,
      34,
      72,
      53,
      72,
      58,
      45,
      100
    ],
    "target": [
      48,
      54,
      27,
      78,
      38
    ]
  },
  "ambition": {
    "label": "Ambition & performance",
    "insight": "turning effort into visible results",
    "ennea": [
      66,
      63,
      100,
      75,
      67,
      55,
      82,
      98,
      45
    ],
    "target": [
      59,
      89,
      74,
      38,
      36
    ]
  },
  "risk": {
    "label": "Risk & improvisation",
    "insight": "betting on an unconventional opening",
    "ennea": [
      43,
      57,
      68,
      76,
      47,
      44,
      100,
      93,
      59
    ],
    "target": [
      87,
      40,
      87,
      42,
      57
    ]
  },
  "adaptability": {
    "label": "Adaptability & escape",
    "insight": "keeping an exit and another angle",
    "ennea": [
      52,
      62,
      70,
      84,
      74,
      70,
      100,
      87,
      80
    ],
    "target": [
      88,
      51,
      62,
      58,
      46
    ]
  },
  "preparation": {
    "label": "Preparation & contingency",
    "insight": "having a plan for what might go wrong",
    "ennea": [
      89,
      74,
      68,
      65,
      100,
      100,
      52,
      72,
      72
    ],
    "target": [
      71,
      94,
      29,
      53,
      60
    ]
  },
  "persistence": {
    "label": "Persistence & repetition",
    "insight": "staying power and stubborn consistency",
    "ennea": [
      96,
      76,
      84,
      71,
      75,
      84,
      60,
      93,
      100
    ],
    "target": [
      37,
      90,
      33,
      63,
      32
    ]
  },
  "support": {
    "label": "Support & relationships",
    "insight": "strengthening the people and systems around you",
    "ennea": [
      66,
      100,
      66,
      90,
      56,
      77,
      74,
      52,
      95
    ],
    "target": [
      70,
      65,
      66,
      95,
      40
    ]
  }
});

export const HELD_ITEMS = Object.freeze([
  {
    "name": "Choice Specs",
    "family": "control",
    "effect": "Boosts Sp. Atk, but locks the holder into one move.",
    "quip": "One excellent answer. Unfortunately, it's now your only answer.",
    "targets": [
      82,
      95,
      18,
      40,
      26
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Choice Band",
    "family": "control",
    "effect": "Boosts Attack, but locks the holder into one move.",
    "quip": "Committed to the plan. The plan is punching.",
    "targets": [
      25,
      88,
      86,
      23,
      22
    ],
    "roles": [
      "Sweeper",
      "Tank"
    ]
  },
  {
    "name": "Choice Scarf",
    "family": "control",
    "effect": "Boosts Speed, but locks the holder into one move.",
    "quip": "Made a quick decision. Will defend it indefinitely.",
    "targets": [
      68,
      67,
      90,
      24,
      50
    ],
    "roles": [
      "Sweeper",
      "Pivot"
    ]
  },
  {
    "name": "Wide Lens",
    "family": "control",
    "effect": "Slightly raises the accuracy of the holder's moves.",
    "quip": "Has checked the spreadsheet a second time.",
    "targets": [
      64,
      97,
      31,
      45,
      34
    ],
    "roles": [
      "Controller",
      "Support"
    ]
  },
  {
    "name": "Zoom Lens",
    "family": "control",
    "effect": "Increases accuracy when moving after the target.",
    "quip": "Not late. Gathering more information.",
    "targets": [
      48,
      90,
      11,
      41,
      45
    ],
    "roles": [
      "Wall",
      "Tank"
    ]
  },
  {
    "name": "Scope Lens",
    "family": "control",
    "effect": "Raises the chance of landing critical hits.",
    "quip": "Pays attention to details nobody asked about.",
    "targets": [
      90,
      79,
      50,
      27,
      31
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Grip Claw",
    "family": "control",
    "effect": "Extends how long binding moves trap the target.",
    "quip": "This conversation has an agenda, and it's not done.",
    "targets": [
      40,
      93,
      37,
      24,
      58
    ],
    "roles": [
      "Controller",
      "Wall"
    ]
  },
  {
    "name": "Binding Band",
    "family": "control",
    "effect": "Raises the residual damage of binding moves.",
    "quip": "The issue was resolved. The follow-up meeting was not.",
    "targets": [
      30,
      94,
      32,
      21,
      64
    ],
    "roles": [
      "Controller",
      "Wall"
    ]
  },
  {
    "name": "Rocky Helmet",
    "family": "protection",
    "effect": "Hurts foes that hit the holder with contact moves.",
    "quip": "You initiated contact. That's on you.",
    "targets": [
      33,
      77,
      39,
      22,
      30
    ],
    "roles": [
      "Wall",
      "Tank"
    ]
  },
  {
    "name": "Covert Cloak",
    "family": "protection",
    "effect": "Blocks additional effects of the opponent's attacks.",
    "quip": "Feedback received. Additional effects will be ignored.",
    "targets": [
      61,
      79,
      21,
      43,
      35
    ],
    "roles": [
      "Wall",
      "Controller"
    ]
  },
  {
    "name": "Assault Vest",
    "family": "protection",
    "effect": "Raises Sp. Def, but prevents the use of status moves.",
    "quip": "Emotionally armored. Communication options limited.",
    "targets": [
      35,
      83,
      65,
      22,
      24
    ],
    "roles": [
      "Tank",
      "Wall"
    ]
  },
  {
    "name": "Protective Pads",
    "family": "protection",
    "effect": "Prevents effects caused by the holder making contact.",
    "quip": "Participates, but with clearly defined boundaries.",
    "targets": [
      55,
      78,
      51,
      51,
      42
    ],
    "roles": [
      "Pivot",
      "Tank"
    ]
  },
  {
    "name": "Safety Goggles",
    "family": "protection",
    "effect": "Protects against powder moves and weather chip damage.",
    "quip": "Prepared for an issue nobody else can see.",
    "targets": [
      66,
      92,
      25,
      44,
      57
    ],
    "roles": [
      "Wall",
      "Support"
    ]
  },
  {
    "name": "Clear Amulet",
    "family": "protection",
    "effect": "Stops opponents from lowering the holder's stats.",
    "quip": "Constructive criticism has failed to penetrate.",
    "targets": [
      73,
      80,
      58,
      29,
      38
    ],
    "roles": [
      "Tank",
      "Controller"
    ]
  },
  {
    "name": "Ability Shield",
    "family": "protection",
    "effect": "Keeps opponents from changing or suppressing the holder's Ability.",
    "quip": "My personality is not up for negotiation.",
    "targets": [
      53,
      85,
      34,
      36,
      49
    ],
    "roles": [
      "Wall",
      "Support"
    ]
  },
  {
    "name": "Kee Berry",
    "family": "protection",
    "effect": "Raises Defense after a physical hit, then is consumed.",
    "quip": "That hurt. The boundaries have been upgraded.",
    "targets": [
      42,
      66,
      33,
      62,
      74
    ],
    "roles": [
      "Wall",
      "Tank"
    ]
  },
  {
    "name": "Leftovers",
    "family": "recovery",
    "effect": "Restores a little HP at the end of each turn.",
    "quip": "Somehow still here. Refuses to elaborate.",
    "targets": [
      40,
      57,
      22,
      79,
      29
    ],
    "roles": [
      "Wall",
      "Tank"
    ]
  },
  {
    "name": "Black Sludge",
    "family": "recovery",
    "effect": "Restores Poison types, but harms other holders each turn.",
    "quip": "Self-care, provided the chemistry is correct.",
    "targets": [
      70,
      57,
      24,
      61,
      70
    ],
    "roles": [
      "Wall",
      "Controller"
    ]
  },
  {
    "name": "Shell Bell",
    "family": "recovery",
    "effect": "Restores HP based on damage the holder deals.",
    "quip": "Turns small victories into a wellness program.",
    "targets": [
      52,
      77,
      48,
      54,
      28
    ],
    "roles": [
      "Tank",
      "Sweeper"
    ]
  },
  {
    "name": "Sitrus Berry",
    "family": "recovery",
    "effect": "Restores HP when the holder falls below half health.",
    "quip": "Has finally agreed this counts as an emergency.",
    "targets": [
      30,
      70,
      25,
      75,
      49
    ],
    "roles": [
      "Wall",
      "Support"
    ]
  },
  {
    "name": "Oran Berry",
    "family": "recovery",
    "effect": "Restores a small amount of HP once.",
    "quip": "Not a complete solution. Just a snack.",
    "targets": [
      63,
      41,
      61,
      91,
      27
    ],
    "roles": [
      "Support",
      "Pivot"
    ]
  },
  {
    "name": "Lum Berry",
    "family": "recovery",
    "effect": "Cures a status condition once.",
    "quip": "There was a moment. We are moving past it.",
    "targets": [
      68,
      56,
      49,
      83,
      62
    ],
    "roles": [
      "Pivot",
      "Support"
    ]
  },
  {
    "name": "Leppa Berry",
    "family": "recovery",
    "effect": "Restores PP to a depleted move once.",
    "quip": "Running on the last reserve of enthusiasm.",
    "targets": [
      44,
      67,
      33,
      81,
      48
    ],
    "roles": [
      "Controller",
      "Support"
    ]
  },
  {
    "name": "Big Root",
    "family": "recovery",
    "effect": "Increases the HP recovered by draining moves.",
    "quip": "Every interaction must be at least a little restorative.",
    "targets": [
      79,
      55,
      50,
      67,
      47
    ],
    "roles": [
      "Tank",
      "Controller"
    ]
  },
  {
    "name": "Flame Orb",
    "family": "ambition",
    "effect": "Burns the holder after a turn; used to trigger Guts.",
    "quip": "Motivation by manageable self-inflicted emergency.",
    "targets": [62,81,69,42,50],
    "roles": ["Tank", "Sweeper"],
    "strategyOnly": true
  },
  {
    "name": "Toxic Orb",
    "family": "recovery",
    "effect": "Badly poisons the holder after a turn; Poison Heal turns it into recovery.",
    "quip": "The poison is now part of the wellness plan.",
    "targets": [69,73,28,57,48],
    "roles": ["Wall", "Tank"],
    "strategyOnly": true
  },
  {
    "name": "Life Orb",
    "family": "ambition",
    "effect": "Boosts move damage, but costs HP after attacks.",
    "quip": "More power. Sustainability was never discussed.",
    "targets": [
      71,
      80,
      83,
      21,
      44
    ],
    "roles": [
      "Sweeper",
      "Tank"
    ]
  },
  {
    "name": "Expert Belt",
    "family": "ambition",
    "effect": "Boosts damage from super-effective moves.",
    "quip": "Only interested in opportunities with obvious leverage.",
    "targets": [
      79,
      85,
      65,
      32,
      23
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Muscle Band",
    "family": "ambition",
    "effect": "Slightly boosts the power of physical moves.",
    "quip": "Performance review: hit things harder.",
    "targets": [
      25,
      92,
      85,
      37,
      28
    ],
    "roles": [
      "Sweeper",
      "Tank"
    ]
  },
  {
    "name": "Wise Glasses",
    "family": "ambition",
    "effect": "Slightly boosts the power of special moves.",
    "quip": "Read another book. Improved the damage output.",
    "targets": [
      87,
      91,
      24,
      45,
      24
    ],
    "roles": [
      "Controller",
      "Sweeper"
    ]
  },
  {
    "name": "Metronome",
    "family": "ambition",
    "effect": "Increases the power of repeatedly using the same move.",
    "quip": "Found what works. Please stop suggesting alternatives.",
    "targets": [
      35,
      98,
      47,
      28,
      38
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Weakness Policy",
    "family": "ambition",
    "effect": "Sharply boosts both offenses after a super-effective hit.",
    "quip": "Criticism received. Converted into performance metrics.",
    "targets": [
      60,
      85,
      82,
      22,
      78
    ],
    "roles": [
      "Tank",
      "Sweeper"
    ]
  },
  {
    "name": "Throat Spray",
    "family": "ambition",
    "effect": "Boosts Sp. Atk after using a sound-based move.",
    "quip": "Made one announcement. Now has a platform.",
    "targets": [
      75,
      67,
      93,
      51,
      33
    ],
    "roles": [
      "Sweeper",
      "Support"
    ]
  },
  {
    "name": "Loaded Dice",
    "family": "ambition",
    "effect": "Makes multi-hit moves more likely to strike repeatedly.",
    "quip": "The plan now includes several additional iterations.",
    "targets": [
      64,
      91,
      66,
      28,
      52
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Blunder Policy",
    "family": "risk",
    "effect": "Sharply raises Speed after the holder misses a move.",
    "quip": "Mistakes were made. Productivity increased.",
    "targets": [
      88,
      38,
      88,
      45,
      62
    ],
    "roles": [
      "Sweeper",
      "Pivot"
    ]
  },
  {
    "name": "Quick Claw",
    "family": "risk",
    "effect": "Sometimes allows the holder to move first.",
    "quip": "Wasn't ready. Went first anyway.",
    "targets": [
      68,
      42,
      97,
      40,
      57
    ],
    "roles": [
      "Pivot",
      "Sweeper"
    ]
  },
  {
    "name": "Bright Powder",
    "family": "risk",
    "effect": "Makes opposing moves slightly less accurate.",
    "quip": "The contingency plan is to be inconvenient to aim at.",
    "targets": [
      86,
      45,
      72,
      25,
      55
    ],
    "roles": [
      "Pivot",
      "Wall"
    ]
  },
  {
    "name": "King's Rock",
    "family": "risk",
    "effect": "Sometimes makes damaged targets flinch.",
    "quip": "The interruption was strategically timed. Probably.",
    "targets": [
      48,
      62,
      82,
      24,
      33
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Razor Fang",
    "family": "risk",
    "effect": "Sometimes makes damaged targets flinch.",
    "quip": "A small provocation with ambitious consequences.",
    "targets": [
      85,
      48,
      94,
      19,
      47
    ],
    "roles": [
      "Sweeper",
      "Pivot"
    ]
  },
  {
    "name": "Focus Band",
    "family": "risk",
    "effect": "Sometimes lets the holder survive a knockout with 1 HP.",
    "quip": "Survival plan: statistically questionable confidence.",
    "targets": [
      61,
      30,
      61,
      46,
      84
    ],
    "roles": [
      "Tank",
      "Sweeper"
    ]
  },
  {
    "name": "Lax Incense",
    "family": "risk",
    "effect": "Slightly lowers the accuracy of opposing moves.",
    "quip": "What if the problem simply failed to arrive?",
    "targets": [
      75,
      22,
      40,
      75,
      35
    ],
    "roles": [
      "Wall",
      "Pivot"
    ]
  },
  {
    "name": "Air Balloon",
    "family": "risk",
    "effect": "Makes the holder immune to Ground moves until it is hit.",
    "quip": "Technically above all these problems.",
    "targets": [
      96,
      35,
      84,
      44,
      41
    ],
    "roles": [
      "Pivot",
      "Sweeper"
    ]
  },
  {
    "name": "Eject Button",
    "family": "adaptability",
    "effect": "Switches the holder out after taking a hit.",
    "quip": "Has already left the conversation.",
    "targets": [
      78,
      48,
      65,
      60,
      62
    ],
    "roles": [
      "Pivot",
      "Support"
    ]
  },
  {
    "name": "Eject Pack",
    "family": "adaptability",
    "effect": "Switches the holder out after its stats are lowered.",
    "quip": "One unfavorable development and the exit strategy activates.",
    "targets": [
      74,
      69,
      44,
      52,
      73
    ],
    "roles": [
      "Pivot",
      "Controller"
    ]
  },
  {
    "name": "Shed Shell",
    "family": "adaptability",
    "effect": "Lets the holder switch out even when trapped.",
    "quip": "Will not be added to this recurring meeting.",
    "targets": [
      67,
      65,
      40,
      38,
      55
    ],
    "roles": [
      "Pivot",
      "Wall"
    ]
  },
  {
    "name": "Red Card",
    "family": "adaptability",
    "effect": "Forces an attacker to switch out when the holder is hit.",
    "quip": "The conversation is over. You're leaving.",
    "targets": [
      52,
      64,
      75,
      18,
      48
    ],
    "roles": [
      "Wall",
      "Pivot"
    ]
  },
  {
    "name": "Room Service",
    "family": "adaptability",
    "effect": "Lowers the holder's Speed when Trick Room takes effect.",
    "quip": "Adapted to the situation by getting slower.",
    "targets": [
      82,
      61,
      25,
      54,
      37
    ],
    "roles": [
      "Controller",
      "Wall"
    ]
  },
  {
    "name": "Iron Ball",
    "family": "adaptability",
    "effect": "Halves Speed and grounds the holder.",
    "quip": "The brilliant pivot has become a stationary project.",
    "targets": [
      59,
      44,
      21,
      61,
      35
    ],
    "roles": [
      "Tank",
      "Wall"
    ]
  },
  {
    "name": "Lagging Tail",
    "family": "adaptability",
    "effect": "Makes the holder move last within its priority bracket.",
    "quip": "Happy to go last. Has been evaluating everyone else.",
    "targets": [
      80,
      43,
      18,
      74,
      32
    ],
    "roles": [
      "Wall",
      "Controller"
    ]
  },
  {
    "name": "Utility Umbrella",
    "family": "adaptability",
    "effect": "Shields the holder from certain effects of harsh weather.",
    "quip": "Weather is happening, but not to this agenda.",
    "targets": [
      89,
      57,
      47,
      65,
      55
    ],
    "roles": [
      "Pivot",
      "Support"
    ]
  },
  {
    "name": "Focus Sash",
    "family": "preparation",
    "effect": "Survives a single knockout hit at full HP, then breaks.",
    "quip": "There was, in fact, a contingency plan for this.",
    "targets": [
      61,
      96,
      25,
      52,
      64
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Mental Herb",
    "family": "preparation",
    "effect": "Cures mental restrictions such as Taunt or Encore once.",
    "quip": "I will not be taking follow-up questions.",
    "targets": [
      72,
      86,
      43,
      37,
      52
    ],
    "roles": [
      "Support",
      "Controller"
    ]
  },
  {
    "name": "White Herb",
    "family": "preparation",
    "effect": "Restores lowered stats once.",
    "quip": "Had a backup version of the previous self.",
    "targets": [
      58,
      93,
      32,
      54,
      61
    ],
    "roles": [
      "Tank",
      "Pivot"
    ]
  },
  {
    "name": "Power Herb",
    "family": "preparation",
    "effect": "Skips the charging turn of a two-turn move once.",
    "quip": "Months of preparation for one suspiciously fast response.",
    "targets": [
      87,
      96,
      45,
      40,
      35
    ],
    "roles": [
      "Sweeper",
      "Controller"
    ]
  },
  {
    "name": "Absorb Bulb",
    "family": "preparation",
    "effect": "Raises Sp. Atk when hit by a Water move, then is consumed.",
    "quip": "Had a plan specifically for unexpected moisture.",
    "targets": [
      81,
      75,
      36,
      49,
      67
    ],
    "roles": [
      "Controller",
      "Tank"
    ]
  },
  {
    "name": "Cell Battery",
    "family": "preparation",
    "effect": "Raises Attack when hit by an Electric move, then is consumed.",
    "quip": "The emergency is now a power source.",
    "targets": [
      60,
      78,
      67,
      42,
      75
    ],
    "roles": [
      "Tank",
      "Sweeper"
    ]
  },
  {
    "name": "Snowball",
    "family": "preparation",
    "effect": "Raises Attack when hit by an Ice move, then is consumed.",
    "quip": "A cold reception was part of the training regimen.",
    "targets": [
      75,
      72,
      66,
      32,
      69
    ],
    "roles": [
      "Tank",
      "Sweeper"
    ]
  },
  {
    "name": "Luminous Moss",
    "family": "preparation",
    "effect": "Raises Sp. Def when hit by a Water move, then is consumed.",
    "quip": "A remarkably specific contingency was justified.",
    "targets": [
      93,
      89,
      19,
      63,
      58
    ],
    "roles": [
      "Wall",
      "Support"
    ]
  },
  {
    "name": "Everstone",
    "family": "persistence",
    "effect": "Prevents the holder from evolving.",
    "quip": "Personal growth is welcome. Change requests are closed.",
    "targets": [
      32,
      97,
      27,
      56,
      19
    ],
    "roles": [
      "Wall",
      "Tank"
    ]
  },
  {
    "name": "Eviolite",
    "family": "persistence",
    "effect": "Boosts Def and Sp. Def if the holder can still evolve.",
    "quip": "Not finished becoming. Still very hard to move.",
    "targets": [
      52,
      88,
      25,
      64,
      42
    ],
    "roles": [
      "Wall",
      "Tank"
    ]
  },
  {
    "name": "Heavy-Duty Boots",
    "family": "persistence",
    "effect": "Prevents damage and effects from entry hazards.",
    "quip": "Too experienced to step on that again.",
    "targets": [
      57,
      87,
      37,
      47,
      32
    ],
    "roles": [
      "Pivot",
      "Wall"
    ]
  },
  {
    "name": "Terrain Extender",
    "family": "persistence",
    "effect": "Makes the holder's terrain effects last longer.",
    "quip": "Has made the environment everyone's problem for eight turns.",
    "targets": [
      69,
      84,
      68,
      62,
      46
    ],
    "roles": [
      "Support",
      "Controller"
    ]
  },
  {
    "name": "Heat Rock",
    "family": "persistence",
    "effect": "Makes sunny weather created by the holder last longer.",
    "quip": "Still bringing up that one really good season.",
    "targets": [
      55,
      92,
      72,
      56,
      28
    ],
    "roles": [
      "Support",
      "Controller"
    ]
  },
  {
    "name": "Damp Rock",
    "family": "persistence",
    "effect": "Makes rainy weather created by the holder last longer.",
    "quip": "Committed to the atmosphere, even if it is damp.",
    "targets": [
      70,
      79,
      38,
      83,
      55
    ],
    "roles": [
      "Support",
      "Wall"
    ]
  },
  {
    "name": "Icy Rock",
    "family": "persistence",
    "effect": "Makes snow created by the holder last longer.",
    "quip": "Cold, consistent, and surprisingly intentional.",
    "targets": [
      43,
      95,
      19,
      45,
      30
    ],
    "roles": [
      "Wall",
      "Controller"
    ]
  },
  {
    "name": "Smooth Rock",
    "family": "persistence",
    "effect": "Makes sandstorms created by the holder last longer.",
    "quip": "The plan has become part of the weather.",
    "targets": [
      40,
      90,
      41,
      35,
      49
    ],
    "roles": [
      "Tank",
      "Controller"
    ]
  },
  {
    "name": "Soothe Bell",
    "family": "support",
    "effect": "Helps the holder gain friendship more quickly.",
    "quip": "Relationship building, now with an accessory.",
    "targets": [
      65,
      58,
      65,
      98,
      29
    ],
    "roles": [
      "Support",
      "Pivot"
    ]
  },
  {
    "name": "Destiny Knot",
    "family": "support",
    "effect": "Reflects infatuation; also passes more IVs when breeding.",
    "quip": "Somehow turned emotional attachment into inherited paperwork.",
    "targets": [
      80,
      65,
      65,
      87,
      54
    ],
    "roles": [
      "Support",
      "Controller"
    ]
  },
  {
    "name": "Light Clay",
    "family": "support",
    "effect": "Makes Reflect, Light Screen and Aurora Veil last longer.",
    "quip": "Good boundaries should come with extended coverage.",
    "targets": [
      50,
      81,
      45,
      92,
      38
    ],
    "roles": [
      "Support",
      "Wall"
    ]
  },
  {
    "name": "Mirror Herb",
    "family": "support",
    "effect": "Copies an opponent's stat boosts once.",
    "quip": "That's a lovely quality. I'll be using it.",
    "targets": [
      95,
      48,
      79,
      74,
      40
    ],
    "roles": [
      "Pivot",
      "Support"
    ]
  },
  {
    "name": "Grassy Seed",
    "family": "support",
    "effect": "Boosts Defense when Grassy Terrain becomes active.",
    "quip": "Apparently thrives when everyone else touches grass.",
    "targets": [
      75,
      63,
      51,
      88,
      38
    ],
    "roles": [
      "Support",
      "Tank"
    ]
  },
  {
    "name": "Misty Seed",
    "family": "support",
    "effect": "Boosts Sp. Def when Misty Terrain becomes active.",
    "quip": "Emotional clarity requires a suitable environment.",
    "targets": [
      82,
      70,
      32,
      94,
      56
    ],
    "roles": [
      "Support",
      "Wall"
    ]
  },
  {
    "name": "Electric Seed",
    "family": "support",
    "effect": "Boosts Defense when Electric Terrain becomes active.",
    "quip": "The group is energized. Has immediately developed armor.",
    "targets": [
      62,
      71,
      85,
      68,
      57
    ],
    "roles": [
      "Support",
      "Pivot"
    ]
  },
  {
    "name": "Psychic Seed",
    "family": "support",
    "effect": "Boosts Sp. Def when Psychic Terrain becomes active.",
    "quip": "Thinks better when everyone agrees to a mental framework.",
    "targets": [
      95,
      74,
      30,
      77,
      48
    ],
    "roles": [
      "Support",
      "Controller"
    ]
  }
]);

// Targets are Big Five affinities in the order O / C / E / A / N.
// Roles and Enneagram family themes provide additional, modest signals.
