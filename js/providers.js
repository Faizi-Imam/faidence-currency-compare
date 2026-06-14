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
    }
];
