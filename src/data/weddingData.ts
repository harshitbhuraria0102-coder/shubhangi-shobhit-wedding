export interface WeddingData {
  hashtag: string;
  monogram: {
    groomInitial: string;
    brideInitial: string;
  };
  intro: {
    line1: string;
    line2: string;
  };
  coverDate: string;
  inviteLine: string;
  enterLabel: string;
  welcomeLine: string;
  presenceLine: string;
  groom: {
    name: string;
    role: string;
    parents: string;
    photo: string;
  };
  bride: {
    name: string;
    role: string;
    parents: string;
    photo: string;
  };
  ceremony: {
    isoDateTime: string;
    timeZoneLabel: string;
    timeLabel: string;
    dateLabel: string;
    dayLabel: string;
    monthYear: string;
    dateStrip: {
      day: string;
      month: string;
      year: string;
      weekday: string;
    };
    city: string;
    state: string;
    venue: string;
    address: string;
    mapsUrl: string;
  };
  stay: {
    eyebrow: string;
    heading: string;
    note: string;
    backdrops: string[];
    hotels: Array<{
      name: string;
      address: string;
      mapsUrl: string;
      image?: string;
    }>;
  };
  grandparents: {
    eyebrow: string;
    lines: string[];
    awaiting: string;
    signatory: string;
    date: string;
  };
  film: {
    heading: string;
    heading2: string;
    poster: string;
    videoUrl: string;
    pendingNote: string;
  };
  music: {
    url: string;
    label: string;
  };
  ticker: string[];
  events: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    address: string;
    mapsUrl: string;
    description: string;
    dressCode: string;
    image: string;
  }>;
  shrinathji: {
    invocation: string;
    hindi: string;
    transliteration: string;
    verse: string;
  };
  images: {
    hero: string;
    shrinathji: string;
    monogram: string;
    couple: string;
    venue: string;
    reception: string;
    logo: string;
    mandap: string;
  };
  rsvp: {
    whatsappNumber: string;
    contactName: string;
  };
  closing: {
    line: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
  };
  thankYou: string;
}

export const weddingData: WeddingData = {
  hashtag: "#ShubhHit",
  monogram: {
    groomInitial: "S",
    brideInitial: "S"
  },
  intro: {
    line1: "Some Journeys Begin with a Glance,",
    line2: "Ours Begin with a Promise."
  },
  coverDate: "4th & 5th December 2026",
  inviteLine: "Invite you to witness the beginning of their forever.",
  enterLabel: "Tap to enter our celebration",
  welcomeLine: "As we embark on a beautiful new journey of togetherness, we warmly invite you to join and bless us in our wedding celebrations.",
  presenceLine: "Your Presence will be our Greatest Gift.",
  groom: {
    name: "Shobhit Bhutra",
    role: "The Groom",
    parents: "Mrs. Sadhna & Mr. Ashok Bhutra",
    photo: "/images/shobhit.jpeg"
  },
  bride: {
    name: "Shubhangi Bhuraria",
    role: "The Bride",
    parents: "Mrs. Alka & Mr. Rajiv Bhuraria",
    photo: "/images/shubhangi.jpeg"
  },
  ceremony: {
    isoDateTime: "2026-12-05T19:00:00+05:30",
    timeZoneLabel: "IST (Asia/Kolkata)",
    timeLabel: "seven in the evening",
    dateLabel: "5 December 2026",
    dayLabel: "Saturday",
    monthYear: "December 2026",
    dateStrip: {
      day: "05",
      month: "Dec",
      year: "2026",
      weekday: "Sat"
    },
    city: "Agra",
    state: "Uttar Pradesh",
    venue: "Lotus Gold",
    address: "LOTUS GOLD, Fatehabad Rd, opposite JP Hotel, Pushpanjali Puram Phase 3, JP Nagar, Tajganj, Agra, Tora, Uttar Pradesh 282004",
    mapsUrl: "https://maps.app.goo.gl/HYCFvjnpptKxfZEaA?g_st=ac"
  },
  stay: {
    eyebrow: "For our guests",
    heading: "Making Your Stay Special",
    note: "A little comfort arranged with love — we would be delighted to have you stay with us at either of these hotels.",
    backdrops: [
      "/assets/aistudio/hotel-front-view_9d186f1e.jpg",
      "/assets/aistudio/caption_dfd7c817.jpg"
    ],
    hotels: [
      {
        name: "Elinor Hotel and Resort",
        address: "Opposite Shilpgram Parking, Tajganj, Agra.",
        image: "/assets/aistudio/hotel-front-view_9d186f1e.jpg",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Elinor%20Hotel%20and%20Resort%20Agra%2C%20Opposite%20Shilpgram%20Parking%2C%20Tajganj%2C%20Agra"
      },
      {
        name: "Hotel The Agra Grande",
        address: 'Near "I Love Agra" Selfie Point, Basai Khurd, Tajganj, Fatehabad Road, Agra.',
        image: "/assets/aistudio/caption_dfd7c817.jpg",
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel%20The%20Agra%20Grande%2C%20Basai%20Khurd%2C%20Tajganj%2C%20Fatehabad%20Road%2C%20Agra'
      }
    ]
  },
  grandparents: {
    eyebrow: "आशीर्वचन",
    lines: [
      "दादा दादी के लिए इससे बड़ा सुख और सौभाग्य क्या होगा कि अपनी पोती को जीवन की नई राह पर कदम रखते हुए देखें।",
      "इस मांगलिक अवसर पर आपकी गरिमामयी उपस्थिति नवदंपति को अपना स्नेह, आशीर्वाद और हमारे परिवार को अपार खुशियाँ प्रदान करेगी।",
      "आपका आगमन हमारे इस पारिवारिक उत्सव की शोभा बढ़ाएगा।"
    ],
    awaiting: "प्रतीक्षारत",
    signatory: "गोपीकिशन माहेश्वरी – पुष्पा माहेश्वरी",
    date: "दिनांक 04–05 दिसम्बर 2026"
  },
  film: {
    heading: "A promise made.",
    heading2: "A forever awaited.",
    poster: "/images/hero.png",
    videoUrl: "",
    pendingNote: "Our wedding film is being edited. It will play right here soon."
  },
  music: {
    url: "/audio/wedding-song.mp3",
    label: "Background music"
  },
  ticker: [
    "Agra",
    "5 December 2026",
    "Two Hearts, One Celebration",
    "#ShubhHit"
  ],
  events: [
    {
      id: "carnival",
      title: "The Pastel Affair",
      date: "2026-12-04",
      time: "12:30 p.m",
      venue: "Triveni Greens",
      city: "Agra",
      address: "Triveni Greens, no 67, Fatehabad Rd, Tajganj, Agra, Tora, Uttar Pradesh 282006",
      mapsUrl: "https://maps.app.goo.gl/5TgBExZC7qpxo3fF6?g_st=ac",
      description: "Step into a dreamy afternoon painted in pastels, filled with laughter, love, games and a little bit of magic. Come dressed in your prettiest pastel hues and let the celebrations begin!",
      dressCode: "Floral & Flowy Fabrics",
      image: "/images/event_carnival.png"
    },
    {
      id: "sangeet",
      title: "Beats and Blings",
      date: "2026-12-04",
      time: "7:00 p.m.",
      venue: "Triveni Greens",
      city: "Agra",
      address: "Triveni Greens, no 67, Fatehabad Rd, Tajganj, Agra, Tora, Uttar Pradesh 282006",
      mapsUrl: "https://maps.app.goo.gl/5TgBExZC7qpxo3fF6?g_st=ac",
      description: "Bring out the shimmer, turn up the music and get ready to own the dance floor! A sparkling night of performances, laughter and non-stop celebration awaits.",
      dressCode: "Glitz and Glam",
      image: "/images/event_sangeet.png"
    },
    {
      id: "mayra",
      title: "Mamero Mahotsav",
      date: "2026-12-05",
      time: "10:30 a.m",
      venue: "Elinor Hotel and Resort Banquet Hall",
      city: "Agra",
      address: "Elinor Hotel and Resort, Opposite Shilpgram Parking, Tajganj, Agra.",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Elinor%20Hotel%20and%20Resort%20Agra%2C%20Opposite%20Shilpgram%20Parking%2C%20Tajganj%2C%20Agra",
      description: "Celebrating Mayra with cherished traditions, joyful moments and the blessings of family as we get closer to the big day.",
      dressCode: "Vibrant Traditionals and Festive Vibes",
      image: "/images/event_mayra.png"
    },
    {
      id: "wedding",
      title: "Shubharambh",
      date: "2026-12-05",
      time: "7:00 p.m",
      venue: "Lotus Gold",
      city: "Agra",
      address: "LOTUS GOLD, Fatehabad Rd, opposite JP Hotel, Pushpanjali Puram Phase 3, JP Nagar, Tajganj, Agra, Tora, Uttar Pradesh 282004",
      mapsUrl: "https://maps.app.goo.gl/HYCFvjnpptKxfZEaA?g_st=ac",
      description: "Amidst sacred traditions, heartfelt blessings and the people closest to our hearts, join us as we celebrate love and take our first steps towards forever.",
      dressCode: "Royal Indian Attire",
      image: "/images/event_wedding.jpg"
    }
  ],
  shrinathji: {
    invocation: "॥ श्री नाथ जी ॥",
    hindi: "जय श्री कृष्णा।",
    transliteration: "Jai Shree Krishna",
    verse: "॥ श्री कृष्ण शरणम् मम ॥"
  },
  images: {
    hero: "/images/hero.png",
    shrinathji: "/images/shrinathji.jpg",
    monogram: "/images/monogram.jpeg",
    couple: "/images/hero.png",
    venue: "/images/hotel1.png",
    reception: "/images/hero.png",
    logo: "/images/logo.jpeg",
    mandap: "/images/mandap.png"
  },
  rsvp: {
    whatsappNumber: "917355646191",
    contactName: "Rajiv Bhuraria"
  },
  closing: {
    line: "With Love,"
  },
  contact: {
    phone: "",
    whatsapp: ""
  },
  thankYou: "The best moments in life are meant to be shared. Thank you for being a part of our story. We cannot wait to celebrate this beautiful beginning with you!"
};
