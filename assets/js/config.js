/* =====================================================================
   ARTIST — site configuration
   Edit this file to add the trailer, contact details, fact-sheet items
   and to change which stills appear in the film strip.
   Nothing here needs a build step: save and refresh.
   ===================================================================== */
window.ARTIST_CONFIG = {

  /* ---- Trailer ---------------------------------------------------------
     type: null      → shows the "Trailer — coming soon" panel
           "file"    → src: "assets/media/trailer.mp4" (put the file there)
           "youtube" → src: the video id, e.g. "dQw4w9WgXcQ"
           "vimeo"   → src: the numeric id, e.g. "76979871"
     poster: still shown before playback (file type only). */
  trailer: {
    type: null,
    src: "",
    poster: "assets/img/posters/poster-2.webp",
    captions: "" // optional .vtt for the file type, e.g. "assets/media/trailer.en.vtt"
  },

  /* ---- Downloadable pitch deck (PDF) -----------------------------------
     Put the PDF at this path to show a download button, or set to "". */
  deckPdf: "",

  /* ---- Contact (not in the pitch deck — fill in before publishing) ---- */
  contact: {
    name: "",      // e.g. "Dani (a) Purushothman"
    email: "",     // e.g. "hello@example.com"
    phone: "",
    instagram: ""  // full URL
  },

  /* ---- Fact sheet --------------------------------------------------------
     Items with an empty value are hidden. The deck gives the first five. */
  facts: [
    ["Title", "Artist (ART!ST)"],
    ["Language", "Tamil"],
    ["Genre", "Psychological mystery thriller"],
    ["Type", "Independent debut feature"],
    ["Writer · Director · Producer", "Dani (a) Purushothman"],
    ["Production", "The Noche Visuals Production"],
    ["Status", "Displaying soon"],
    ["Runtime", ""],
    ["Year", ""],
    ["Format / aspect ratio", ""],
    ["Sound", ""],
    ["Subtitles", ""]
  ],

  /* ---- Film strip (Frames of Artist, deck p.14–18) ---------------------
     Reel labels describe what is on screen, not the plot. */
  reels: [
    { label: "Red room", page: 14, stills: [
      ["still-red-1", "A gagged man in a white shirt, red light."],
      ["still-red-2", "A man confronts a captive in a room covered in black spray-painted scribbles and pinned sketches."],
      ["still-red-3", "A distressed man raises his hands; a captive in the background."],
      ["still-red-4", "A captive strung up against the wall beside a black box."]
    ]},
    { label: "White room", page: 15, stills: [
      ["still-white-1", "A gagged woman in white sits against the wall, wrists tied."],
      ["still-white-2", "A man in a patterned shirt points away; the woman in white watches."],
      ["still-white-3", "Close-up: the woman lies gagged on a white mattress."],
      ["still-white-4", "Wide: the bare white room, a figure curled on the mattress."]
    ]},
    { label: "Outdoors", page: 16, stills: [
      ["still-nature-1", "Top shot: a gagged man tied to a tree."],
      ["still-nature-2", "A man in a patterned shirt faces the sea."],
      ["still-nature-3", "Aerial: a lone figure lying in a forest clearing."],
      ["still-nature-4", "Birds perched on rocks in a still lake."]
    ]},
    { label: "Daylight", page: 17, stills: [
      ["still-search-1", "A man in black walks out through a rusted ornate gate."],
      ["still-search-2", "A worried family group: a pregnant woman between two men."],
      ["still-search-3", "A tense moment in a car."],
      ["still-search-4", "A man on the phone leans against a swirling Starry Night-style mural."]
    ]},
    { label: "Night & water", page: 18, stills: [
      ["still-dark-1", "A police officer at a station desk."],
      ["still-dark-2", "A wounded, bloodied man."],
      ["still-dark-3", "A couple in a car at night; the woman on the phone."],
      ["still-dark-4", "A man in a white shirt underwater in a tiled pool."]
    ]}
  ],

  /* ---- Original deck viewer ---------------------------------------------
     One title per page. `spoiler: true` pages stay veiled until the
     visitor opens the sealed section or confirms in the viewer. */
  deck: [
    "Title", "Introduction", "Log line", "Story", "Genre", "Tone",
    "Structure of Artist", "Structure in detail", "The world",
    { title: "What the true incident is all about", spoiler: true },
    "Comparables", "Market place", "Frames of Artist",
    "Frames — red room", "Frames — white room", "Frames — outdoors", "Frames — daylight", "Frames — night & water",
    "Some reference posters", "Audience attraction", "Director's marketing strategy",
    "Cast", "Sidhu Kumaresan", "Yaathisai", "Neelira", "Thangalaan", "Master · Maanavan · Shawarma", "P2 · Untitled",
    "Gopinath Shankar", "Finder", "Bomb", "Minor", "Ram Babu", "Other actors",
    "Crew", "Director statement", "About the director", "Film statement", "The End"
  ]
};
