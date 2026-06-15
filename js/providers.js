/**
 * Currency Exchange Comparison Platform - Providers Engine
 * Defines formulas, markups, speeds, and delivery methods for each provider.
 */

const PROVIDERS = [
    {
        name: "Wise",
        id: "wise",
        logo: "W",
        logoColor: "#00b9ff", // Wise Blue
        speed: "1-2 Days",
        speedMinutes: 1440,
        methods: ["bank"],
        website: "https://wise.com",
        // Wise has the lowest markup (closer to mid-market)
        markupPercent: 0.35, 
        // Fee formula: flat fee + percentage of amount
        calculateFee: function(amount) {
            return 1.50 + (amount * 0.004); 
        }
    },
    {
        name: "PayPal",
        id: "paypal",
        logo: "P",
        logoColor: "#003087", // PayPal Dark Blue
        speed: "Instant",
        speedMinutes: 5,
        methods: ["bank"],
        website: "https://paypal.com",
        // PayPal has high hidden markups on exchange rates
        markupPercent: 3.5,
        // Flat international transaction fee
        calculateFee: function(amount) {
            return 4.99;
        }
    },
    {
        name: "Skydo",
        id: "skydo",
        logo: "S",
        logoColor: "#10b981", // Skydo Green
        speed: "1 Day",
        speedMinutes: 1440,
        methods: ["bank"],
        website: "https://skydo.com",
        // Skydo charges 0% exchange rate markup
        markupPercent: 0,
        // Flat fee tier: e.g., $19 flat fee up to $2000, $29 flat fee above $2000
        calculateFee: function(amount) {
            return amount <= 2000 ? 19.00 : 29.00;
        }
    },
    {
        name: "Xflow",
        id: "xflow",
        logo: "X",
        logoColor: "#6366f1", // Xflow Indigo
        speed: "1 Day",
        speedMinutes: 1440,
        methods: ["bank"],
        website: "https://xflow.in",
        // Xflow has an all-inclusive 0.75% fee, 0% markup
        markupPercent: 0,
        calculateFee: function(amount) {
            return amount * 0.0075;
        }
    },
    {
        name: "MoneyGram",
        id: "moneygram",
        logo: "M",
        logoColor: "#e11b22", // MoneyGram Red
        speed: "Instant to 1 Day",
        speedMinutes: 60,
        methods: ["bank", "cash", "wallet"],
        website: "https://moneygram.com",
        markupPercent: 1.8,
        calculateFee: function(amount) {
            if (amount < 500) return 2.99;
            return 4.99;
        }
    },
    {
        name: "Ria Money Transfer",
        id: "ria",
        logo: "R",
        logoColor: "#ff7c00", // Ria Orange
        speed: "0-2 Days",
        speedMinutes: 120,
        methods: ["bank", "cash"],
        website: "https://riamoneytransfer.com",
        markupPercent: 1.4,
        calculateFee: function(amount) {
            return 1.99;
        }
    },
    {
        name: "Western Union",
        id: "westernunion",
        logo: "W",
        logoColor: "#ffcc00", // WU Yellow
        speed: "Instant to 2 Days",
        speedMinutes: 180,
        methods: ["bank", "cash", "wallet"],
        website: "https://westernunion.com",
        markupPercent: 1.9,
        calculateFee: function(amount) {
            if (amount < 200) return 0.99;
            if (amount < 1000) return 2.99;
            return 5.99;
        }
    },
    {
        name: "Remitly",
        id: "remitly",
        logo: "R",
        logoColor: "#4f46e5", // Remitly Violet
        speed: "Instant to 2 Days",
        speedMinutes: 120,
        methods: ["bank", "cash", "wallet"],
        website: "https://remitly.com",
        markupPercent: 1.2,
        calculateFee: function(amount) {
            return 3.99;
        }
    },
    {
        name: "WorldRemit",
        id: "worldremit",
        logo: "W",
        logoColor: "#ec4899", // WorldRemit Pink
        speed: "Instant to 1 Day",
        speedMinutes: 60,
        methods: ["bank", "cash", "wallet"],
        website: "https://worldremit.com",
        markupPercent: 1.5,
        calculateFee: function(amount) {
            return 2.99;
        }
    }
];
