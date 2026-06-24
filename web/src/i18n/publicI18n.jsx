import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sukahomestay-language";

const translations = {
  ms: {
    languageSwitch: {
      bm: "BM",
      en: "EN",
      settings: "Tetapan Bahasa",
      chooseLanguage: "Pilih bahasa laman web",
    },
    propertyTypes: {
      homestay: "Homestay",
      roomstay: "Roomstay",
      whole_house: "Satu Rumah",
    },
    nav: {
      home: "Utama",
      stays: "Penginapan",
      facilities: "Kemudahan",
      gallery: "Galeri",
      howItWorks: "Cara Tempahan",
      reviews: "Ulasan",
      contact: "Hubungi",
    },
    header: {
      brandTag: "Homestay",
      startBooking: "Mula Tempah",
      whatsappAdmin: "WhatsApp Admin",
    },
    footer: {
      description:
        "Terokai pilihan penginapan yang dipercayai, semak tarikh semasa, dan tempah terus melalui pengalaman hospitaliti yang lebih kemas.",
      explore: "Terokai",
      howBookingWorks: "Cara Tempahan",
      contact: "Hubungi",
      copyright: "Hak cipta",
    },
    home: {
      eyebrow: "Pengalaman tempahan Sukahomestay",
      title: "Tempahan homestay berbilang halaman yang lebih tenang untuk semua.",
      description:
        "Terokai jenis penginapan, semak kemudahan, lihat kalendar, dan tempah terus dengan sokongan tempatan.",
      ctas: {
        checkAvailability: "Semak Ketersediaan",
        bookNow: "Tempah Sekarang",
        whatsappAdmin: "WhatsApp Admin",
      },
      imageBadge: "Imej utama penginapan",
      imageTitle:
        "Ruang yang hangat untuk penginapan keluarga, trip berkumpulan, dan sokongan tempatan secara terus.",
      stayPreviewEyebrow: "Pilihan penginapan",
      stayPreviewTitle: "Mulakan dengan jenis penginapan yang sesuai untuk perjalanan anda.",
    },
    pages: {
      stays: {
        badge: "Penginapan",
        title: "Lihat semua pilihan penginapan Sukahomestay di satu tempat.",
        description:
          "Bandingkan pilihan homestay, roomstay, dan satu rumah sebelum beralih ke semakan ketersediaan atau tempahan.",
      },
      homestay: {
        badge: "Homestay",
        title: "Penginapan penuh untuk kumpulan lebih besar dan urusan yang lebih mudah.",
        description:
          "Penginapan luas mesra keluarga untuk kumpulan yang mahukan pengalaman rumah utama Sukahomestay sepenuhnya.",
        cta: "Tempah Homestay",
        errorTitle: "Butiran homestay tidak dapat dimuatkan",
        fallbackDescription:
          "Penginapan selesa untuk percutian keluarga, perjumpaan hujung minggu, dan sambutan berskala kecil.",
      },
      roomstay: {
        badge: "Roomstay",
        title: "Pilihan bilik peribadi untuk penginapan singkat dan perancangan yang lebih mudah.",
        description:
          "Pilih salah satu bilik peribadi kami dengan bilik air, kapasiti tetamu yang fleksibel, dan sokongan tempahan terus.",
        cta: "Mula Tempahan Bilik",
        errorTitle: "Butiran roomstay tidak dapat dimuatkan",
      },
      wholeHouse: {
        badge: "Satu Rumah",
        title: "Tempah keseluruhan rumah untuk penginapan berkumpulan yang lebih privasi.",
        description:
          "Sesuai untuk kumpulan yang lebih besar yang mahukan pengalaman tempahan seluruh rumah, privasi tambahan, dan urusan yang lebih ringkas.",
        cta: "Tempah Satu Rumah",
      },
      facilities: {
        badge: "Kemudahan",
        title: "Keselesaan, ciri praktikal, dan pengalaman tetamu yang lebih jelas.",
        description:
          "Lihat kemudahan dan butiran sokongan yang membentuk pengalaman penginapan Sukahomestay.",
      },
      gallery: {
        badge: "Galeri",
        title: "Lihat suasana penginapan dan kawasan sekitar yang berdekatan.",
        description:
          "Terokai pratonton visual penginapan, kemudian lihat apa yang tersedia berdekatan untuk makanan, masa keluarga, dan aktiviti santai.",
      },
      howItWorks: {
        badge: "Cara Tempahan",
        title: "Ikuti perjalanan tempahan daripada semakan kalendar hingga pengesahan.",
        description:
          "Halaman ini menerangkan aliran tepat yang digunakan tetamu untuk menyemak tarikh, memilih jenis penginapan, dan menghantar permintaan tempahan terus.",
      },
      reviews: {
        badge: "Ulasan",
        title: "Maklum balas tetamu, soalan lazim, dan keyakinan sebelum tempahan.",
        description:
          "Baca bagaimana tetamu sebelum ini menggambarkan pengalaman tempahan, kemudian semak soalan yang paling biasa sebelum penginapan anda.",
      },
      contact: {
        badge: "Hubungi",
        title: "Hubungi admin, semak lokasi, dan teruskan ke tempahan dengan cepat.",
        description:
          "Gunakan halaman ini apabila anda mahu butiran hubungan terus, sokongan WhatsApp, atau laluan yang lebih pantas ke permintaan tempahan.",
      },
      availability: {
        badge: "Kalendar Tempahan",
        title: "Pilih tarikh anda dari kalendar penuh dan tempah dalam aliran yang sama.",
        description:
          "Gunakan kalendar penuh di bawah, pilih jenis penginapan, pilih tarikh, kemudian teruskan ke borang tempahan.",
      },
      bookingSuccess: {
        title: "Permintaan tempahan diterima",
        description:
          "Permintaan anda telah disimpan sebagai pending. Sila teruskan penyelarasan bayaran melalui WhatsApp dan pasukan kami akan mengesahkan penginapan anda.",
        summaryTitle: "Ringkasan bayaran tempahan",
        backHome: "Kembali ke Utama",
        notifyAdmin: "Maklumkan Admin",
      },
    },
    shared: {
      propertyDescriptions: {
        homestay:
          "Penginapan penuh yang selesa untuk keluarga, hujung minggu santai, dan urusan kumpulan yang lebih mudah.",
        roomstay:
          "Pilihan bilik peribadi yang fleksibel untuk tetamu yang mahukan penginapan ringkas dengan sokongan terus.",
        whole_house:
          "Sesuai untuk tempahan seluruh rumah apabila anda perlukan lebih privasi dan ruang bersama untuk kumpulan besar.",
      },
      labels: {
        bedrooms: "Bilik tidur",
        bathrooms: "Bilik air",
        guests: "Tetamu",
        maxGuests: "Tetamu maksimum",
        from: "Dari",
        perNight: "Semalam",
        nights: "Jumlah malam",
        room: "Bilik",
        roomId: "ID bilik",
        bookingType: "Jenis tempahan",
        checkIn: "Daftar masuk",
        checkOut: "Daftar keluar",
        support: "Sokongan",
        totalToPay: "Jumlah perlu dibayar",
        selectedDate: "Tarikh dipilih",
        total: "Jumlah",
      },
      trustStats: [
        { value: "4.9/5", label: "kepuasan tetamu" },
        { value: "24/7", label: "bantuan tempahan" },
        { value: "3 jenis penginapan", label: "untuk keluarga dan kumpulan" },
        { value: "Tempahan terus", label: "tanpa kesulitan platform pihak ketiga" },
      ],
      facilities: [
        "Parkir peribadi",
        "Wi-Fi pantas",
        "Bilik berhawa dingin",
        "Ruang makan keluarga",
        "Sokongan daftar masuk sendiri",
        "Linen bersih dan kelengkapan asas",
      ],
      whyChooseUs: [
        {
          title: "Tempahan bermula dengan kalendar",
          description:
            "Tetamu boleh melihat tarikh yang tersedia dahulu, kemudian beralih ke tempahan tanpa meneka ketersediaan.",
        },
        {
          title: "Pilihan penginapan fleksibel",
          description:
            "Tempah homestay penuh, roomstay, atau satu rumah mengikut saiz kumpulan anda.",
        },
        {
          title: "Sokongan tempatan secara terus",
          description:
            "Sokongan WhatsApp menjadikan perbualan lebih mudah dari pertanyaan pertama hingga pengesahan akhir.",
        },
      ],
      nearbyAttractions: [
        {
          title: "Kafe pusat bandar",
          description: "Pilihan sarapan mudah, tempat kopi, dan makanan santai dalam jarak pemanduan singkat.",
          distance: "8 minit dari sini",
        },
        {
          title: "Taman rekreasi keluarga",
          description: "Kawasan hijau terbuka untuk kanak-kanak, berjalan petang, dan masa santai di luar.",
          distance: "12 minit dari sini",
        },
        {
          title: "Jalan makanan tempatan",
          description: "Kawasan makan malam popular dengan pilihan tempatan dan makanan lewat malam yang ringkas.",
          distance: "15 minit dari sini",
        },
      ],
      bookingSteps: [
        "Semak kalendar ketersediaan.",
        "Pilih jenis penginapan yang sesuai untuk kumpulan anda.",
        "Hantar permintaan tempahan dengan tarikh pilihan anda.",
        "Sahkan terus dengan admin melalui WhatsApp.",
      ],
      testimonials: [
        {
          quote:
            "Proses tempahan terasa sangat jelas. Kami semak kalendar dahulu dan dapat pengesahan dengan cepat.",
          name: "Aina",
          trip: "Penginapan hujung minggu keluarga",
        },
        {
          quote:
            "Pilihan roomstay memudahkan kumpulan kecil kami. Tempat bersih, komunikasi lancar, tiada kekeliruan.",
          name: "Firdaus",
          trip: "Trip jalan-jalan bersama kawan",
        },
        {
          quote:
            "Kami tempah satu rumah dan sokongan WhatsApp terus membantu kami selesaikan butiran dengan cepat.",
          name: "Nadia",
          trip: "Perjumpaan berkumpulan",
        },
      ],
      faqs: [
        {
          question: "Bagaimana saya tahu tarikh saya tersedia?",
          answer:
            "Mulakan dengan pratonton kalendar atau halaman kalendar penuh. Tarikh yang disekat tidak boleh dipilih untuk tempahan.",
        },
        {
          question: "Boleh saya tempah satu bilik sahaja dan bukan seluruh rumah?",
          answer:
            "Ya. Pilihan roomstay direka untuk tetamu yang hanya memerlukan bilik peribadi dan bukan keseluruhan homestay.",
        },
        {
          question: "Bagaimana tempahan akhir disahkan?",
          answer:
            "Selepas anda menghantar permintaan tempahan, admin akan menyemak butiran penginapan dan mengesahkan secara terus dengan anda.",
        },
      ],
      stayPreview: {
        ctaAvailability: "Semak Ketersediaan",
        ctaDetails: "Lihat Butiran",
      },
      propertyShowcase: {
        ctaAvailability: "Semak Ketersediaan",
        ctaDetails: "Lihat Butiran",
        roomMeta: "{guests} tetamu, {bedrooms} bilik tidur, {bathrooms} bilik air",
      },
      facilitiesSection: {
        eyebrow: "Kemudahan",
        title: "Kemudahan yang menjadikan setiap penginapan mudah, praktikal, dan selesa.",
        description:
          "Susun atur penginapan direka untuk keselesaan keluarga, ketibaan yang mudah, dan ruang bersama yang mesra kumpulan.",
      },
      whyChooseSection: {
        eyebrow: "Mengapa pilih kami",
        title: "Pengalaman tempahan yang direka untuk rasa lebih jelas dan lebih peribadi.",
      },
      calendarPreview: {
        eyebrow: "Pratonton kalendar ketersediaan",
        title: "Semak tarikh semasa sebelum memilih penginapan yang tepat.",
        interactiveDescription:
          "Pratonton ini menjadikan aliran tempahan lebih telus. Tarikh yang terbuka boleh terus dibawa ke permintaan tempahan.",
        previewDescription:
          "Pratonton ini menunjukkan cara tetamu menyemak tarikh terbuka sebelum beralih ke kalendar tempahan penuh.",
        bookNow: "Tempah Sekarang",
      },
      gallerySection: {
        eyebrow: "Galeri",
        title: "Pratonton visual suasana penginapan.",
      },
      nearbySection: {
        eyebrow: "Tarikan berdekatan",
        title: "Terokai kawasan sekitar dengan perancangan yang lebih mudah.",
      },
      howBookingWorks: {
        eyebrow: "Cara tempahan",
        title: "Dari semakan tarikh pertama hingga pengesahan akhir dalam empat langkah yang jelas.",
        description:
          "Perjalanan ini direka untuk mengurangkan ketidakpastian dan mengekalkan perbualan tempahan secara terus.",
      },
      testimonialsSection: {
        eyebrow: "Ulasan tetamu",
        title: "Maklum balas sebenar daripada tetamu yang menempah secara terus.",
      },
      faqSection: {
        eyebrow: "Soalan Lazim",
        title: "Soalan yang biasa ditanya sebelum anda menempah.",
      },
      whatsappCta: {
        eyebrow: "WhatsApp",
        title: "Perlukan jawapan cepat sebelum menempah?",
        description:
          "Berbual terus dengan admin untuk semakan tarikh, cadangan penginapan, atau permintaan khas.",
        cta: "WhatsApp Admin",
      },
      contactSection: {
        eyebrow: "Hubungi",
        title: "Hubungi pasukan kami dan semak lokasi sebelum penginapan anda.",
        description:
          "Gunakan peta untuk memahami lokasi, kemudian buka permintaan tempahan atau mesej admin secara terus.",
        adminTitle: "Admin Sukahomestay",
        whatsappLabel: "WhatsApp",
        emailLabel: "E-mel",
        bookNow: "Tempah Sekarang",
        whatsappAdmin: "WhatsApp Admin",
        mapTitle: "Peta lokasi Sukahomestay",
      },
      booking: {
        sectionEyebrow: "Bahagian tempahan",
        sectionTitle: "Pilih jenis penginapan anda, kemudian pilih tarikh dari kalendar.",
        sectionDescription:
          "Ini ialah kalendar tempahan sebenar. Klik tarikh untuk memilihnya, kemudian gunakan butang tempahan untuk meneruskan.",
        roomIdHelp: "ID Bilik (untuk roomstay sahaja)",
        selectRoom: "Pilih bilik",
        noRoomstayRooms: "Tiada bilik roomstay tersedia",
        roomstayOnly: "Hanya untuk roomstay",
        paymentSummary: "Ringkasan bayaran",
        ratePerNight: "Kadar semalam",
        paymentManualNote:
          "Pengesahan bayaran diurus secara manual melalui WhatsApp selepas anda menghantar permintaan tempahan.",
        bookNow: "Tempah Sekarang",
      },
      modal: {
        eyebrow: "Permintaan Tempahan",
        title: "Tempah terus dari kalendar yang anda pilih",
        description:
          "Tarikh daftar masuk telah diisi awal. Kemas kini butiran penginapan yang lain dan hantar permintaan secara terus.",
        close: "Tutup",
      },
      bookingForm: {
        fullName: "Nama penuh",
        fullNamePlaceholder: "Nama penuh anda",
        phone: "Nombor telefon",
        phonePlaceholder: "60123456789",
        email: "E-mel",
        emailPlaceholder: "anda@example.com",
        guests: "Tetamu",
        checkIn: "Daftar masuk",
        checkOut: "Daftar keluar",
        bookingType: "Jenis tempahan",
        roomId: "ID bilik",
        roomIdDisabled: "Hanya digunakan untuk roomstay",
        roomIdRequired: "Pilih bilik roomstay",
        specialRequest: "Permintaan khas",
        amountSummary: "Jumlah bayaran manual",
        totalToPayWhatsapp: "Jumlah perlu dibayar melalui WhatsApp",
        submit: "Hantar permintaan tempahan",
        submitting: "Sedang dihantar...",
      },
      bookingSuccess: {
        bookingType: "Jenis tempahan",
        guests: "Tetamu",
        checkIn: "Daftar masuk",
        checkOut: "Daftar keluar",
        room: "Bilik",
        totalNights: "Jumlah malam",
        totalToPay: "Jumlah perlu dibayar secara manual",
      },
      roomCard: {
        badge: "Roomstay",
        cta: "Tempah bilik ini",
      },
      errors: {
        datesAvailable: "Tarikh tersedia",
        datesUnavailable: "Tarikh tidak tersedia",
        stayAvailable: "Penginapan yang dipilih kelihatan tersedia.",
        stayUnavailable: "Penginapan ini tidak tersedia buat masa ini",
      },
    },
  },
  en: {
    languageSwitch: {
      bm: "BM",
      en: "EN",
      settings: "Language Settings",
      chooseLanguage: "Choose website language",
    },
    propertyTypes: {
      homestay: "Homestay",
      roomstay: "Roomstay",
      whole_house: "Whole House",
    },
    nav: {
      home: "Home",
      stays: "Stays",
      facilities: "Facilities",
      gallery: "Gallery",
      howItWorks: "How It Works",
      reviews: "Reviews",
      contact: "Contact",
    },
    header: {
      brandTag: "Homestays",
      startBooking: "Start Booking",
      whatsappAdmin: "WhatsApp Admin",
    },
    footer: {
      description:
        "Discover trusted stay options, review live dates, and book directly through a cleaner hospitality experience.",
      explore: "Explore",
      howBookingWorks: "How Booking Works",
      contact: "Contact",
      copyright: "Copyright",
    },
    home: {
      eyebrow: "Sukahomestay booking experience",
      title: "A calmer, multipage homestay booking journey for everyone.",
      description:
        "Explore the stay types, review facilities, check the calendar, and book directly with local support.",
      ctas: {
        checkAvailability: "Check Availability",
        bookNow: "Book Now",
        whatsappAdmin: "WhatsApp Admin",
      },
      imageBadge: "Main property image",
      imageTitle:
        "Warm spaces for family stays, group trips, and direct local support.",
      stayPreviewEyebrow: "Stay previews",
      stayPreviewTitle: "Start with the stay type that matches your trip.",
    },
    pages: {
      stays: {
        badge: "Stays",
        title: "Browse every Sukahomestay stay option in one place.",
        description:
          "Compare the homestay, roomstay, and whole-house options before moving into availability or booking.",
      },
      homestay: {
        badge: "Homestay",
        title: "A full-property stay built for bigger groups and easier coordination.",
        description:
          "Spacious family-friendly stay for groups who want the full Sukahomestay main-house experience.",
        cta: "Book Homestay",
        errorTitle: "Unable to load homestay details",
        fallbackDescription:
          "Comfortable lodging for family trips, weekend gatherings, and small celebrations.",
      },
      roomstay: {
        badge: "Roomstay",
        title: "Private room options for shorter stays and easier trip planning.",
        description:
          "Choose one of our private rooms with attached bathrooms, flexible guest capacity, and direct booking support.",
        cta: "Start Room Booking",
        errorTitle: "Unable to load roomstay details",
      },
      wholeHouse: {
        badge: "Whole House",
        title: "Reserve the whole property for a more private group stay.",
        description:
          "Best for larger groups who want the full-property booking experience, extra privacy, and simpler coordination.",
        cta: "Book Whole House",
      },
      facilities: {
        badge: "Facilities",
        title: "Comfort, practical features, and a clearer guest experience.",
        description:
          "See the facilities and support details that shape the Sukahomestay stay experience.",
      },
      gallery: {
        badge: "Gallery",
        title: "See the stay atmosphere and the nearby surroundings.",
        description:
          "Explore a visual preview of the property, then see what sits nearby for food, family time, and relaxed outings.",
      },
      howItWorks: {
        badge: "How It Works",
        title: "Follow the booking journey from calendar check to confirmation.",
        description:
          "This page explains the exact flow guests use to review dates, choose a stay type, and submit a direct booking request.",
      },
      reviews: {
        badge: "Reviews",
        title: "Guest feedback, common questions, and booking confidence.",
        description:
          "Read how past guests describe the booking experience, then review the most common questions before your stay.",
      },
      contact: {
        badge: "Contact",
        title: "Reach the admin, review the location, and move straight into booking.",
        description:
          "Use this page when you want the direct contact details, WhatsApp support, or a faster route into the booking request.",
      },
      availability: {
        badge: "Booking Calendar",
        title: "Pick your dates from the full calendar and book from the same flow.",
        description:
          "Use the full calendar below, choose your stay type, select a date, then continue through the booking form.",
      },
      bookingSuccess: {
        title: "Booking request received",
        description:
          "Your request has been saved as pending. Please continue payment coordination over WhatsApp and our team will confirm the stay with you.",
        summaryTitle: "Booking payment summary",
        backHome: "Back To Home",
        notifyAdmin: "Notify Admin",
      },
    },
    shared: {
      propertyDescriptions: {
        homestay:
          "A comfortable full-property stay for families, relaxed weekends, and easier group coordination.",
        roomstay:
          "A flexible private-room option for guests who want a simpler stay with direct support.",
        whole_house:
          "Best for full-house bookings when you need more privacy and shared space for larger groups.",
      },
      labels: {
        bedrooms: "Bedrooms",
        bathrooms: "Bathrooms",
        guests: "Guests",
        maxGuests: "Max Guests",
        from: "From",
        perNight: "Per Night",
        nights: "Total nights",
        room: "Room",
        roomId: "Room ID",
        bookingType: "Booking type",
        checkIn: "Check-in",
        checkOut: "Check-out",
        support: "Support",
        totalToPay: "Total to pay",
        selectedDate: "Selected date",
        total: "Total",
      },
      trustStats: [
        { value: "4.9/5", label: "guest satisfaction" },
        { value: "24/7", label: "booking assistance" },
        { value: "3 stay modes", label: "for families and groups" },
        { value: "Direct booking", label: "without marketplace friction" },
      ],
      facilities: [
        "Private parking",
        "Fast Wi-Fi",
        "Air-conditioned rooms",
        "Family dining area",
        "Self check-in support",
        "Clean linen and essentials",
      ],
      whyChooseUs: [
        {
          title: "Calendar-first booking",
          description:
            "Guests can see open dates first, then move into booking without guessing availability.",
        },
        {
          title: "Flexible stay options",
          description:
            "Book a full homestay, a roomstay unit, or the whole house depending on your group size.",
        },
        {
          title: "Direct local support",
          description:
            "WhatsApp support keeps the conversation simple from first question to final confirmation.",
        },
      ],
      nearbyAttractions: [
        {
          title: "Town centre cafes",
          description: "Easy breakfast stops, coffee spots, and casual meals within a short drive.",
          distance: "8 minutes away",
        },
        {
          title: "Family recreation park",
          description: "Open green space for kids, evening walks, and relaxed outdoor time.",
          distance: "12 minutes away",
        },
        {
          title: "Local food street",
          description: "Popular evening dining area with local favourites and simple late-night options.",
          distance: "15 minutes away",
        },
      ],
      bookingSteps: [
        "Check the availability calendar.",
        "Choose the stay type that fits your group.",
        "Send the booking request with your selected date.",
        "Confirm directly with the admin on WhatsApp.",
      ],
      testimonials: [
        {
          quote:
            "The booking process felt very clear. We checked the calendar first and got confirmation quickly.",
          name: "Aina",
          trip: "Family weekend stay",
        },
        {
          quote:
            "The roomstay option made it easy for a small group. Clean place, smooth communication, no confusion.",
          name: "Firdaus",
          trip: "Friends road trip",
        },
        {
          quote:
            "We booked the whole house and the direct WhatsApp support helped us settle details fast.",
          name: "Nadia",
          trip: "Group gathering",
        },
      ],
      faqs: [
        {
          question: "How do I know if my dates are available?",
          answer:
            "Start with the calendar preview or the full calendar page. Blocked dates cannot be selected for booking.",
        },
        {
          question: "Can I book only one room instead of the full property?",
          answer:
            "Yes. The roomstay option is designed for guests who only need a private room instead of the entire homestay.",
        },
        {
          question: "How is the final booking confirmed?",
          answer:
            "After you submit a booking request, the admin reviews the stay details and confirms directly with you.",
        },
      ],
      stayPreview: {
        ctaAvailability: "Check Availability",
        ctaDetails: "View Details",
      },
      propertyShowcase: {
        ctaAvailability: "Check Availability",
        ctaDetails: "View Details",
        roomMeta: "{guests} guests, {bedrooms} bedroom, {bathrooms} bathroom",
      },
      facilitiesSection: {
        eyebrow: "Facilities",
        title: "Facilities that keep every stay simple, practical, and comfortable.",
        description:
          "The property setup is designed around family comfort, easy arrival, and group-friendly shared spaces.",
      },
      whyChooseSection: {
        eyebrow: "Why choose us",
        title: "A booking experience designed to feel clearer and more personal.",
      },
      calendarPreview: {
        eyebrow: "Availability calendar preview",
        title: "Review live dates before you choose the right stay.",
        interactiveDescription:
          "This preview keeps the booking flow honest. Open dates can move straight into the booking request.",
        previewDescription:
          "This preview shows how guests review open dates before moving into the full booking calendar.",
        bookNow: "Book Now",
      },
      gallerySection: {
        eyebrow: "Gallery",
        title: "A visual preview of the stay atmosphere.",
      },
      nearbySection: {
        eyebrow: "Nearby attractions",
        title: "Explore the surrounding area with less planning friction.",
      },
      howBookingWorks: {
        eyebrow: "How booking works",
        title: "From first date check to final confirmation in four clear steps.",
        description:
          "The journey is designed to reduce uncertainty and keep the booking conversation direct.",
      },
      testimonialsSection: {
        eyebrow: "Guest reviews",
        title: "Real guest feedback from direct stays.",
      },
      faqSection: {
        eyebrow: "FAQ",
        title: "Common questions before you book.",
      },
      whatsappCta: {
        eyebrow: "WhatsApp CTA",
        title: "Need a fast answer before booking?",
        description:
          "Chat directly with the admin for date checks, stay recommendations, or special requests.",
        cta: "WhatsApp Admin",
      },
      contactSection: {
        eyebrow: "Contact",
        title: "Contact the team and check the location before your stay.",
        description:
          "Use the map for location context, then open the booking request or message the admin directly.",
        adminTitle: "Sukahomestay Admin",
        whatsappLabel: "WhatsApp",
        emailLabel: "Email",
        bookNow: "Book Now",
        whatsappAdmin: "WhatsApp Admin",
        mapTitle: "Sukahomestay location map",
      },
      booking: {
        sectionEyebrow: "Booking Section",
        sectionTitle: "Select your stay type, then choose a date from the calendar.",
        sectionDescription:
          "This is the real booking calendar. Click a date to select it, then use the booking button to continue.",
        roomIdHelp: "Room ID (roomstay only)",
        selectRoom: "Select a room",
        noRoomstayRooms: "No roomstay rooms available",
        roomstayOnly: "Only for roomstay",
        paymentSummary: "Payment Summary",
        ratePerNight: "Rate per night",
        paymentManualNote:
          "Payment confirmation is handled manually through WhatsApp after you submit the booking request.",
        bookNow: "Book Now",
      },
      modal: {
        eyebrow: "Booking Request",
        title: "Book from the calendar you just selected",
        description:
          "Your check-in date is prefilled. Update the rest of the stay details and send the request directly.",
        close: "Close",
      },
      bookingForm: {
        fullName: "Full name",
        fullNamePlaceholder: "Your full name",
        phone: "Phone number",
        phonePlaceholder: "60123456789",
        email: "Email",
        emailPlaceholder: "you@example.com",
        guests: "Guests",
        checkIn: "Check-in",
        checkOut: "Check-out",
        bookingType: "Booking type",
        roomId: "Room ID",
        roomIdDisabled: "Only used for roomstay",
        roomIdRequired: "Select a roomstay room",
        specialRequest: "Special request",
        amountSummary: "Amount To Pay Manually",
        totalToPayWhatsapp: "Total to pay via WhatsApp",
        submit: "Submit booking request",
        submitting: "Submitting...",
      },
      bookingSuccess: {
        bookingType: "Booking type",
        guests: "Guests",
        checkIn: "Check-in",
        checkOut: "Check-out",
        room: "Room",
        totalNights: "Total nights",
        totalToPay: "Total to pay manually",
      },
      roomCard: {
        badge: "Roomstay",
        cta: "Book this room",
      },
      errors: {
        datesAvailable: "Dates available",
        datesUnavailable: "Dates unavailable",
        stayAvailable: "The selected stay looks available.",
        stayUnavailable: "This stay is currently unavailable",
      },
    },
  },
};

const PublicI18nContext = createContext(null);

export function PublicI18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "ms";
    }
    return window.localStorage.getItem(STORAGE_KEY) || "ms";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
    document.documentElement.lang = language === "ms" ? "ms" : "en";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      messages: translations[language],
      dateLocale: language === "ms" ? "ms-MY" : "en-MY",
      calendarLocale: language === "ms" ? "ms-MY" : "en-US",
    }),
    [language]
  );

  return (
    <PublicI18nContext.Provider value={value}>
      {children}
    </PublicI18nContext.Provider>
  );
}

export function usePublicI18n() {
  const context = useContext(PublicI18nContext);
  if (!context) {
    throw new Error("usePublicI18n must be used within PublicI18nProvider");
  }
  return context;
}

export function getPropertyTypeLabel(type, messages) {
  return messages.propertyTypes[type] || type;
}
