/**
 * Extracted content + chart datasets for the four "Kerala in Data" research
 * publications. Numbers and prose are the single source of truth here;
 * each version's research/[slug] page renders this data with its own
 * typography and chart palette.
 */

export type HookStat = { value: string; label: string };
export type Callout = { label: string; value: string; sub?: string; tone?: "bad" | "good" };

export type DataStory = {
  slug: string;
  areaLabel: string;
  hookStats: HookStat[];
  hookNote: string;
  lede: string;
  sections: { heading: string; paragraphs: string[] }[];
  callouts?: Callout[];
  whyItMatters: string;
  sources: string[];
};

export const dataStories: Record<string, DataStory> = {
  "malappuram-classrooms": {
    slug: "malappuram-classrooms",
    areaLabel: "Education · Area 04",
    hookStats: [{ value: "65 students a batch", label: "" }],
    hookNote:
      "That's the average Plus One batch size in Malappuram in 2025 — nearly double the 36 students per batch in Pathanamthitta, Kerala's smallest, and well above the statewide average of 54.",
    lede:
      "Kerala added 3.87 lakh Plus One seats across 7,223 batches in 2025. But that capacity isn't spread evenly, and district-level enrollment data shows the same district — Malappuram — carrying both the heaviest classroom load and the thinnest access to the science stream in the state.",
    sections: [
      {
        heading: "The most crowded classrooms in the state",
        paragraphs: [
          "Malappuram enrolled 70,472 Plus One students across 1,080 batches in 2025 — an average of 65 students per batch, the highest of any district and 11 above the all-Kerala average of 54. Wayanad (60) and Kasargode (60) are the next most crowded. Pathanamthitta (36), Idukki (43) and Kottayam (43) run the smallest batches in the state.",
        ],
      },
      {
        heading: "Fewer options in the science stream",
        paragraphs: [
          "Only 42% of Malappuram's Plus One batches are science batches — tied for the lowest share in Kerala with Kasargode (40%), against a statewide average of 51%. Kottayam has the most science capacity, at 63% of its batches, followed by Pathanamthitta at 58%.",
        ],
      },
      {
        heading: "Why it's happening: crowding and stream access move together",
        paragraphs: [
          "Plotting batch size against science-stream share across all 14 districts shows a clear pattern: the districts with the largest average batches — Malappuram, Wayanad, Kasargode — are also the districts with the smallest share of science batches. Districts with smaller, less-crowded batches, like Pathanamthitta and Kottayam, tend to offer proportionally more science seats. That's consistent with a simple capacity story: where the district hasn't been able to open enough batches to match demand, existing seats get stretched thinner and skew toward the lower-cost humanities and commerce streams rather than science, which needs labs and specialised staff to expand.",
        ],
      },
      {
        heading: "Where it's headed: Malappuram's seat demand, 2027–2036",
        paragraphs: [
          "Using 2012–2027 birth records for the district, the projected number of Plus One aspirants in Malappuram is expected to ease only slightly over the coming decade — from 84,265 in 2027 to 77,442 in 2036, an 8.1% decline. But the path isn't a straight line down: demand is projected to rise through the early 2030s, peaking at 86,106 in 2033, before falling toward 2036.",
        ],
      },
    ],
    callouts: [
      { tone: "bad", label: "Peak projected demand", value: "86,106", sub: "expected students, 2033" },
      { tone: "good", label: "Lowest projected demand", value: "77,442", sub: "expected students, 2036" },
    ],
    whyItMatters:
      "Malappuram's Plus One pressure isn't a temporary bulge that will resolve itself in the next year or two — the source data projects demand staying near or above 82,000 students annually through 2035, only easing meaningfully by 2036. Combined with the district already running the most crowded batches and the thinnest science-stream access in the state, that points to a specific, addressable gap: more science batches, not just more batches, in the district that needs them most. Waiting for the demographic decline visible after 2034 to relieve the pressure would mean roughly another decade of Malappuram students facing the largest classes and the fewest science seats in Kerala.",
    sources: [
      "Plus One seat and batch distribution by district, 2025 — batches, enrollment, share of science batches, and students per batch. Kerala Economic Review 2025 (source PDF, p.21).",
      'Plus One seat requirement forecast for Malappuram, 2027–2036, based on 2012–2027 yearly birth records for the district (source PDF, p.22). The source text describes the projected range as "between 84,000 and 77,000," though the year-by-year figures show a peak of 86,106 in 2033 that exceeds the stated upper bound; both the stated range and the full year-by-year series are shown here for transparency.',
    ],
  },

  "kerala-population-mix": {
    slug: "kerala-population-mix",
    areaLabel: "Demography · Area 01",
    hookStats: [
      { value: "29.9%", label: "Muslim share of Kerala's population, 2024 (est.), up from 26.5% in 2011" },
      { value: "−27%", label: "Decline in annual Muslim births in Kerala, 2014 → 2024" },
    ],
    hookNote:
      "Both numbers come from the same underlying community. Read together, they describe a population whose share of the state has grown gradually over more than a decade, but whose birth rate has been falling sharply and recently — the two trends that, together, typically mark a demographic transition settling toward the rest of the state's pattern rather than diverging from it.",
    lede:
      "Kerala publishes religion-wise population estimates only once a decade, at the Census. Between the 2011 Census and 2024 projections, the state's religious composition moved modestly: Hindus' share fell from 54.7% to 52.0%, Christians' share fell from 18.3% to 17.6%, and Muslims' share rose from 26.5% to 29.9%. In absolute numbers, Kerala's Muslim population grew from 88.73 lakh (8,873,472) in 2011 to an estimated 1.08 crore (10,766,903) in 2024.",
    sections: [
      {
        heading: "The share shift since 2011",
        paragraphs: [
          "The rise in Muslims' population share was mirrored mainly by a decline in Hindus' share (−2.7 percentage points) and, to a smaller extent, Christians' (−0.7 points). The 2024 figures are projections ahead of India's next Census, which is due in 2027; the 2011 figures are the last full Census count.",
        ],
      },
      {
        heading: "Why the share is still moving: age structure, not just recent growth",
        paragraphs: [
          "Population share doesn't just reflect this year's births — it reflects decades of past births working their way through the age pyramid. Kerala's 2024 age breakdown shows why the Muslim share has been rising even as recent births slow: Muslims make up 40.3% of Kerala's under-18 population but only 22.6% of its over-40 population. Hindus show the reverse pattern — 42.6% of the under-18 group but 57.4% of the over-40 group. Christians skew older too, at 19.8% of the 40-plus group against 15.7% of the under-18 group.",
          "Put differently: relative to each group's own 29.9% (Muslim), 52.0% (Hindu) and 17.6% (Christian) share of Kerala's total 2024 population, Muslims are over-represented among children and under-represented among older adults, while Hindus show the opposite pattern. That's consistent with Muslims' fertility transition in Kerala having peaked and begun declining later than Hindus' and Christians' — which is exactly what the birth-count data below shows happening now.",
        ],
      },
      {
        heading: "The leading indicator: births are falling fast",
        paragraphs: [
          "The clearest sign that this pattern is already correcting itself is the birth data. The number of births to Muslim families in Kerala fell from 218,437 in 2014 to 159,088 in 2024 — a drop of 59,349 births, or 27%, in a decade. The source data attributes this to later marriage ages driving down fertility, a pattern that is, in turn, expected to shift Kerala's Muslim population toward an older average age over time — the same trajectory Hindu and Christian populations in the state moved through earlier.",
        ],
      },
    ],
    callouts: [
      { label: "Hindu, 2024", value: "52.0%" },
      { label: "Muslim, 2024", value: "29.9%" },
      { label: "Christian, 2024", value: "17.6%" },
    ],
    whyItMatters:
      "Kerala's population mix has shifted gradually over more than a decade, and the age-structure data shows that shift largely reflects past fertility patterns still working through the population, not a trend that is speeding up. The clearest forward-looking signal in this data is the births chart: a 27% drop in a single decade points toward convergence with the rest of the state's fertility pattern, not divergence from it. The practical implication shows up elsewhere in this series — Malappuram, Kerala's most Muslim-majority district, is also its most youth-heavy and carries the state's highest Plus One demand and tightest healthcare capacity today. That's a today's-classroom-and-clinic planning problem rooted in births from 10–18 years ago, not a forecast about the population's future direction, which the birth data suggests is already levelling off.",
    sources: [
      'Share of Muslims, Hindus and Christians in Kerala\'s total population, 2011 (Census) and 2024 (estimated), including absolute Muslim population counts. Source PDF, p.9. The source states the 2011→2024 Muslim share increase as "+3.3" percentage points; the displayed shares (26.5% → 29.9%) round to a 3.4-point difference.',
      "Share of each age bracket (under 18, 18–40, 40+) accounted for by each religious group, Kerala, 2024. Source PDF, p.10.",
      "Annual births to Kerala Muslim families, 2014 and 2024. Sources: Annual Vital Statistics 2006–2024, Census 2011, Voters List LSGD 2025. Source PDF, p.11.",
      '"Representation" chart is a calculated difference between each group\'s age-bracket share (p.10) and that same group\'s overall 2024 population share (p.9) — not a figure stated directly in the source.',
    ],
  },

  "kerala-healthcare-gap": {
    slug: "kerala-healthcare-gap",
    areaLabel: "Health · Area 03",
    hookStats: [{ value: "47,051 people", label: "" }],
    hookNote:
      "That's how many people a single Primary Health Centre serves, on average, in Malappuram — nearly sixteen times the state's own policy target of 3,000 people per PHC, and more than double the figure in Pathanamthitta, Kerala's best-served district.",
    lede:
      "Kerala's public health system is usually held up as a national model. But that reputation is built on statewide averages, and averages hide a lot. Broken down by district, the numbers show a consistent pattern: the same two districts — Malappuram and Kozhikode — fall furthest behind on primary care access, hospital beds and doctor availability, while a different pair — Pathanamthitta and Wayanad — consistently sit ahead of the rest of the state.",
    sections: [
      {
        heading: "The clinic gap",
        paragraphs: [
          "The Government of Kerala's own health policy sets a benchmark of one Primary Health Centre for every 3,000 people. Statewide, the actual figure is 36,303 people per PHC — over twelve times that target. Malappuram, the most populous district, is worst off at 47,051 per PHC; Kozhikode follows at 44,171. At the other end, Pathanamthitta (23,046) and Idukki (23,654) carry roughly half the load.",
        ],
      },
      {
        heading: "It's not just clinics",
        paragraphs: [
          "The same divide shows up in hospital beds. Across Kerala, government hospitals average 928 people per bed. Malappuram again ranks worst, at 1,861 people per bed — almost exactly double the state average. Kozhikode is next at 1,204. Pathanamthitta has the lightest load in the state at 589 per bed, followed by Alappuzha at 632.",
        ],
      },
      {
        heading: "And the same two districts fall behind on doctors, too",
        paragraphs: [
          "Government hospital staffing follows the identical pattern. Malappuram has the highest population-per-doctor ratio in the state at 7,437, with Kozhikode close behind at 7,245. Pathanamthitta has the lowest at 3,754 and Wayanad the second-lowest at 3,930 — meaning a patient in Malappuram is, on this measure, competing with roughly twice as many people for a government doctor's time as a patient in Pathanamthitta.",
        ],
      },
      {
        heading: "A structural gap, not a one-off",
        paragraphs: [
          "What makes this pattern worth flagging isn't any single statistic — it's that it repeats. Malappuram is the worst-performing district on all three measures; Pathanamthitta is the best or near-best on all three. That consistency across independently reported indicators suggests a structural shortfall in health infrastructure in the northern districts, rather than a gap specific to one budget line or one year's data.",
        ],
      },
    ],
    callouts: [
      { tone: "bad", label: "Malappuram vs. Kerala average", value: "≈1.3–2.0×", sub: "higher population load across PHCs, beds and doctors" },
      { tone: "good", label: "Pathanamthitta vs. Kerala average", value: "≈0.5–0.6×", sub: "lower population load across the same three measures" },
    ],
    whyItMatters:
      "Kerala's health infrastructure gap is concentrated, not diffuse — which is, in one sense, good news: it means targeted investment in a small number of districts could close most of the disparity, rather than requiring an across-the-board expansion. Malappuram is also Kerala's most populous and youngest district (see the Demography and Education stories in this series), which means the pressure on its health system is likely to persist even as population growth slows elsewhere in the state. Closing the PHC, bed and doctor gaps there — rather than distributing new capacity evenly across all fourteen districts — would do the most to bring Kerala's district-level health access in line with its statewide reputation.",
    sources: [
      "Population per Primary Health Centre by district, 2024. Health at a Glance 2024; CAG Report on Public Health 2024; List of Modern Medical Institutions 2024–25 (source PDF, p.17).",
      "Population per bed in government hospitals by district. Same sources (source PDF, p.18).",
      "Population per doctor in government hospitals by district. Same sources (source PDF, p.19).",
      "Government of Kerala health policy norm of 3,000 population per PHC, as cited in the source PDF, p.17.",
      "The Malappuram/Pathanamthitta comparison chart plots the two districts' raw figures against the Kerala-wide averages reported for PHCs (p.17) and beds (p.18); no statewide average for population-per-doctor was given in the source, so that panel shows the two districts' figures against the range across all 14 districts (3,754–7,437, p.19) rather than an official average.",
    ],
  },

  "kerala-gulf-migration": {
    slug: "kerala-gulf-migration",
    areaLabel: "Migration · Area 02",
    hookStats: [
      { value: "41.9%", label: "of Kerala's emigrants are Muslim, vs. 29.3% of its total population" },
      { value: "98.5%", label: "of Muslim emigrants go specifically to the Gulf" },
    ],
    hookNote:
      "Both figures point the same way: Muslims are over-represented among Kerala's emigrants relative to their share of the population, and that emigration is concentrated more narrowly on the Gulf than any other community's.",
    lede:
      "Migration has shaped Kerala's economy for half a century, and the Kerala Migration Survey has tracked it since the 1990s. The most recent rounds show that emigration isn't spread across religious groups in proportion to population — and that Muslim emigrants in particular are concentrated in a narrow band of Gulf-based, service-sector jobs that make them more exposed than other groups to downturns abroad.",
    sections: [
      {
        heading: "Emigration skews away from Kerala's population mix",
        paragraphs: [
          "Hindus make up 53.2% of Kerala's population but only 35.2% of its emigrants — the largest gap of any group. Muslims and Christians both emigrate at higher rates than their population share would suggest: Muslims are 29.3% of the population but 41.9% of emigrants, and Christians are 16.9% of the population but 22.3% of emigrants.",
        ],
      },
      {
        heading: "For Muslims, that migration means almost exclusively the Gulf",
        paragraphs: [
          "Kerala's overall dependence on Gulf destinations for emigration is high — 89.2% of the state's emigrants go to the Gulf. But that average hides a real gap by community: 98.5% of Muslim emigrants go to the Gulf, compared with 86.8% of Hindu emigrants and 76.3% of Christian emigrants. Christian emigrants are, comparatively, the most likely of the three groups to go somewhere other than the Gulf — consistent with Kerala's well-documented pattern of Christian, especially nursing, emigration to the US, UK, Australia and Europe, though that specific destination breakdown isn't in this dataset.",
        ],
      },
      {
        heading: "What Muslim migrants do once they're there",
        paragraphs: [
          "Occupational data on Muslim migrants shows a workforce concentrated in service and manual-labour roles: salesman is the single largest category at 23.9%, followed by driver (15%), cashier/peon/office staff (8%), construction labourer (7.1%), hotel staff (6.7%) and storekeeper (6.2%). Together, these six categories account for 66% of Muslim migrants' occupations; the remaining 34% is spread across smaller categories not broken out in the source data.",
        ],
      },
    ],
    callouts: [
      { label: "Muslim Gulf dependence", value: "98.5%" },
      { label: "Top 6 job categories", value: "66%" },
      { label: "Largest single category", value: "Salesman, 23.9%" },
    ],
    whyItMatters:
      "Kerala's own migration data connects Gulf economic downturns to job losses and return migration, and this data shows why that risk isn't evenly spread: Muslim migrants combine the highest Gulf-dependence of any group (98.5%) with concentration in occupational categories — sales, driving, hospitality, construction — that are typically among the first affected when Gulf economies tighten or introduce labour-nationalisation policies. A downturn that Hindu or Christian migrant households could partly offset through more diversified destinations would hit Muslim migrant households more directly. The source data's own framing points to a policy lever: skill development aimed at moving migrants out of the six most exposed occupational categories and into more formal, better-protected roles would reduce that concentration risk without requiring any change in destination.",
    sources: [
      "Emigrant population and total population share by religion, Kerala, 2023. Kerala Migration Survey 2023. Source PDF, p.13.",
      "Dependence on Gulf regions by religious group (share of each group's emigrants who go to the Gulf). Kerala Migration Survey 2018. Source PDF, p.14.",
      '"Representation" chart is a calculated difference between each group\'s emigrant share and total population share (both from p.13) — not a figure stated directly in the source.',
      "Major occupational categories among Muslim migrants. Kerala Migration Survey 2018. Source PDF, p.15. The six listed categories sum to 66% of the total; the source does not break out the remaining 34%.",
    ],
  },
};

// --- Chart datasets (district-level tables underlying each story's charts) ---

export const educationCharts = {
  districts: ["Malappuram", "Wayanad", "Kasargode", "Kozhikkode", "Kannur", "Palakkad", "Thiruvananthapuram", "Thrissur", "Kollam", "Ernakulam", "Alappuzha", "Kottayam", "Idukki", "Pathanamthitta"],
  sciencePct: [42, 44, 40, 47, 47, 47, 58, 54, 57, 57, 57, 63, 51, 58],
  perBatch: [65, 60, 60, 59, 59, 58, 52, 51, 49, 49, 46, 43, 43, 36],
  keralaAvgBatch: 54,
  keralaAvgScience: 51,
  scatterHighlight: ["Malappuram", "Pathanamthitta"],
  forecastYears: [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036],
  forecastVals: [84265, 82437, 83055, 82969, 82118, 84359, 86106, 84920, 81330, 77442],
};

export const demographyCharts = {
  groups2011: [54.7, 26.5, 18.3],
  groups2024: [52.0, 29.9, 17.6],
  ageHindu: [42.6, 51.4, 57.4],
  ageMuslim: [40.3, 32.1, 22.6],
  ageChristian: [15.7, 16.3, 19.8],
  births2014: 218437,
  births2024: 159088,
};

export const healthCharts = {
  phc: {
    districts: ["Malappuram", "Kozhikode", "Kollam", "Ernakulam", "Thrissur", "Thiruvananthapuram", "Palakkad", "Kasaragode", "Wayanad", "Alappuzha", "Kottayam", "Kannur", "Idukki", "Pathanamthitta"],
    values: [47051, 44171, 40112, 38656, 38097, 37798, 36679, 34062, 33540, 32784, 30677, 30643, 23654, 23046],
    keralaAvg: 36303,
    policyTarget: 3000,
  },
  bed: {
    districts: ["Malappuram", "Kozhikode", "Palakkad", "Kollam", "Thrissur", "Kannur", "Idukki", "Kasaragode", "Ernakulam", "Thiruvananthapuram", "Kottayam", "Wayanad", "Alappuzha", "Pathanamthitta"],
    values: [1861, 1204, 1111, 1158, 964, 915, 961, 894, 787, 721, 706, 638, 632, 589],
    keralaAvg: 928,
  },
  doctor: {
    districts: ["Malappuram", "Kozhikode", "Palakkad", "Thrissur", "Kollam", "Ernakulam", "Kannur", "Thiruvananthapuram", "Alappuzha", "Kasaragode", "Kottayam", "Idukki", "Wayanad", "Pathanamthitta"],
    values: [7437, 7245, 6722, 6293, 6290, 5799, 5267, 5158, 4760, 4860, 4703, 4315, 3930, 3754],
  },
  compare: {
    malappuram: [47051, 1861, 7437],
    pathanamthitta: [23046, 589, 3754],
    reference: [36303, 928, 5467],
  },
};

export const migrationCharts = {
  totalPop: [53.2, 29.3, 16.9, 0.6],
  emigrantPop: [35.2, 41.9, 22.3, 0.6],
  gulf: { labels: ["Christian", "Hindu", "Kerala (all)", "Muslim"], values: [76.3, 86.8, 89.2, 98.5] },
  jobs: ["Storekeeper", "Hotel staff", "Construction labourer", "Cashier / peon / office staff", "Driver", "Salesman"],
  jobVals: [6.2, 6.7, 7.1, 8, 15, 23.9],
};
