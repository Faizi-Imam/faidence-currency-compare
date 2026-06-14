/**
 * Currency Exchange Comparison Platform - Main Application Logic
 * Integrates real-time API rate fetching, sessionStorage caching, comparison calculations,
 * filtering, UI interactivity, auto-polling, and historical charts.
 */

// Application State
const state = {
    sourceCurrency: "USD",
    destCurrency: "INR",
    sendAmount: 1000,
    rates: {},
    payoutFilter: "all",
    timeframe: "1W",
    lastFetchedTime: null,
    pollingInterval: null
};

// Initial currencies and their flags (for fallback/display purposes)
const CURRENCY_DETAILS = {
    // North America
    USD: { symbol: "$", flag: "🇺🇸", name: "US Dollar" },
    CAD: { symbol: "CA$", flag: "🇨🇦", name: "Canadian Dollar" },
    MXN: { symbol: "$", flag: "🇲🇽", name: "Mexican Peso" },
    // Europe
    EUR: { symbol: "€", flag: "🇪🇺", name: "Euro" },
    GBP: { symbol: "£", flag: "🇬🇧", name: "British Pound" },
    CHF: { symbol: "Fr", flag: "🇨🇭", name: "Swiss Franc" },
    TRY: { symbol: "₺", flag: "🇹🇷", name: "Turkish Lira" },
    SEK: { symbol: "kr", flag: "🇸🇪", name: "Swedish Krona" },
    NOK: { symbol: "kr", flag: "🇳🇴", name: "Norwegian Krone" },
    PLN: { symbol: "zł", flag: "🇵🇱", name: "Polish Zloty" },
    // Asia
    INR: { symbol: "₹", flag: "🇮🇳", name: "Indian Rupee" },
    PHP: { symbol: "₱", flag: "🇵🇭", name: "Philippine Peso" },
    JPY: { symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" },
    CNY: { symbol: "¥", flag: "🇨🇳", name: "Chinese Yuan" },
    SGD: { symbol: "S$", flag: "🇸🇬", name: "Singapore Dollar" },
    HKD: { symbol: "HK$", flag: "🇭🇰", name: "Hong Kong Dollar" },
    PKR: { symbol: "₨", flag: "🇵🇰", name: "Pakistani Rupee" },
    AED: { symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham" },
    SAR: { symbol: "ر.س", flag: "🇸🇦", name: "Saudi Riyal" },
    MYR: { symbol: "RM", flag: "🇲🇾", name: "Malaysian Ringgit" },
    THB: { symbol: "฿", flag: "🇹🇭", name: "Thai Baht" },
    IDR: { symbol: "Rp", flag: "🇮🇩", name: "Indonesian Rupiah" },
    // Oceania
    AUD: { symbol: "A$", flag: "🇦🇺", name: "Australian Dollar" },
    NZD: { symbol: "NZ$", flag: "🇳🇿", name: "New Zealand Dollar" },
    // South America
    BRL: { symbol: "R$", flag: "🇧🇷", name: "Brazilian Real" },
    ARS: { symbol: "$", flag: "🇦🇷", name: "Argentine Peso" },
    // Africa
    ZAR: { symbol: "R", flag: "🇿🇦", name: "South African Rand" },
    EGP: { symbol: "E£", flag: "🇪🇬", name: "Egyptian Pound" },
    NGN: { symbol: "₦", flag: "🇳🇬", name: "Nigerian Naira" },
    KES: { symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling" },
    GHS: { symbol: "GH₵", flag: "🇬🇭", name: "Ghanaian Cedi" }
};

// DOM Elements
const elements = {
    sendAmount: document.getElementById("send-amount"),
    sourceCurrency: document.getElementById("source-currency"),
    destCurrency: document.getElementById("dest-currency"),
    receiveAmount: document.getElementById("receive-amount"),
    swapBtn: document.getElementById("swap-currencies-btn"),
    comparisonRows: document.getElementById("comparison-rows"),
    lastUpdatedTime: document.getElementById("last-updated-time"),
    btnRefresh: document.getElementById("btn-refresh"),
    filterButtons: document.querySelectorAll(".filter-btn"),
    timeframeButtons: document.querySelectorAll(".btn-timeframe"),
    rateAlertForm: document.getElementById("rate-alert-form"),
    alertTargetRate: document.getElementById("alert-target-rate"),
    alertEmail: document.getElementById("alert-email"),
    alertMessage: document.getElementById("alert-message"),
    alertHeaderPair: document.getElementById("chart-currency-pair")
};

// -------------------------------------------------------------
// Data Fetching & Caching
// -------------------------------------------------------------

/**
 * Fetches currency exchange rates for a given base currency.
 * Utilizes sessionStorage to cache rates for 5 minutes.
 */
async function fetchLatestRates(baseCurrency) {
    const cacheKey = `rates_cache_${baseCurrency}`;
    const cacheTimeKey = `rates_cache_time_${baseCurrency}`;
    const cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    const now = Date.now();
    const cachedData = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    
    if (cachedData && cachedTime && (now - cachedTime < cacheDuration)) {
        console.log(`Using cached rates for ${baseCurrency}`);
        state.rates = JSON.parse(cachedData);
        state.lastFetchedTime = new Date(parseInt(cachedTime));
        updateStatusLabel();
        return state.rates;
    }
    
    try {
        console.log(`Fetching live rates for ${baseCurrency} from API...`);
        const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        if (!response.ok) throw new Error("API Network response failed");
        
        const data = await response.json();
        if (data.result !== "success") throw new Error("API returned failure status");
        
        state.rates = data.rates;
        state.lastFetchedTime = new Date();
        
        // Save to cache
        sessionStorage.setItem(cacheKey, JSON.stringify(data.rates));
        sessionStorage.setItem(cacheTimeKey, now.toString());
        
        updateStatusLabel();
        return state.rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        // Fallback to offline estimation if API fails completely
        if (!state.rates || Object.keys(state.rates).length === 0) {
            state.rates = getFallbackRates(baseCurrency);
            state.lastFetchedTime = new Date();
            updateStatusLabel();
        }
        return state.rates;
    }
}

/**
 * Updates the last updated time label on the UI.
 */
function updateStatusLabel() {
    if (elements.lastUpdatedTime && state.lastFetchedTime) {
        const timeString = state.lastFetchedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        elements.lastUpdatedTime.textContent = timeString;
    }
}

/**
 * Provides static fallback rates if the user is offline or the API rate-limits.
 */
function getFallbackRates(base) {
    // Basic approximate conversions relative to USD
    const usdRates = {
        USD: 1.0, EUR: 0.93, GBP: 0.79, CAD: 1.37, AUD: 1.51,
        AED: 3.67, INR: 83.50, MXN: 18.50, PHP: 58.60, PKR: 278.00,
        CHF: 0.89, TRY: 32.50, SEK: 10.50, NOK: 10.70, PLN: 4.05,
        JPY: 157.0, CNY: 7.25, SGD: 1.35, HKD: 7.80, SAR: 3.75,
        MYR: 4.70, THB: 36.70, IDR: 16400.0, NZD: 1.63, BRL: 5.40,
        ARS: 900.0, ZAR: 18.40, EGP: 47.80, NGN: 1500.0, KES: 129.0,
        GHS: 15.0
    };
    
    if (base === "USD") return usdRates;
    
    const baseToUsdRate = 1 / usdRates[base];
    const convertedRates = {};
    for (const [cur, rate] of Object.entries(usdRates)) {
        convertedRates[cur] = rate * baseToUsdRate;
    }
    return convertedRates;
}

// -------------------------------------------------------------
// Calculations & Render Engine
// -------------------------------------------------------------

/**
 * Performs core comparison calculations and updates the comparison table.
 */
function calculateComparison() {
    const amount = parseFloat(elements.sendAmount.value) || 0;
    state.sendAmount = amount;
    
    const source = elements.sourceCurrency.value;
    const dest = elements.destCurrency.value;
    state.sourceCurrency = source;
    state.destCurrency = dest;
    
    const midMarketRate = state.rates[dest] || 1;
    
    // Update Mid-Market value in the destination input field
    if (elements.receiveAmount) {
        elements.receiveAmount.value = (amount * midMarketRate).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ` ${dest}`;
    }
    
    // Set placeholder rate alert target
    if (elements.alertTargetRate && !elements.alertTargetRate.value) {
        elements.alertTargetRate.value = (midMarketRate * 1.02).toFixed(2); // default target 2% higher
    }
    
    // Prepare provider results
    let results = [];
    
    PROVIDERS.forEach(provider => {
        // Filter out based on payout method selection
        if (state.payoutFilter !== "all" && !provider.methods.includes(state.payoutFilter)) {
            return;
        }
        
        // Fee calculation
        const fee = provider.calculateFee(amount);
        
        // Provider rate offered after their markup subtraction
        const rateOffered = midMarketRate * (1 - (provider.markupPercent / 100));
        
        // Converted amount: (Send Amount - Upfront Fee) * Provider Rate
        const amountDeductFee = Math.max(0, amount - fee);
        const recipientReceives = amountDeductFee * rateOffered;
        
        // Savings vs high street bank (High street banks charge on average a 4.5% markup + $10 fee)
        const bankRate = midMarketRate * 0.955;
        const bankReceives = Math.max(0, amount - 10.0) * bankRate;
        const savings = Math.max(0, recipientReceives - bankReceives);
        
        results.push({
            ...provider,
            fee: fee,
            rateOffered: rateOffered,
            recipientReceives: recipientReceives,
            savings: savings
        });
    });
    
    // Identify Cheapest, Fastest, and Worst options
    if (results.length > 0) {
        // Sort by recipient receives desc (cheapest is the one who delivers most)
        const sortedByPayout = [...results].sort((a, b) => b.recipientReceives - a.recipientReceives);
        const cheapestId = sortedByPayout[0].id;
        const worstId = sortedByPayout[sortedByPayout.length - 1].id;
        
        // Sort by speed mins asc
        const sortedBySpeed = [...results].sort((a, b) => a.speedMinutes - b.speedMinutes);
        const fastestId = sortedBySpeed[0].id;
        
        results.forEach(res => {
            res.isCheapest = (res.id === cheapestId);
            res.isFastest = (res.id === fastestId);
            res.isWorst = (res.id === worstId && res.id !== cheapestId); // make sure it's not both cheapest and worst (if only 1 provider)
        });
    }
    
    renderTable(results, dest, source);
    
    // Trigger Chart render
    renderRateChart(source, dest, midMarketRate, state.timeframe);
}

/**
 * Builds the HTML structure for the comparison table rows.
 */
function renderTable(results, destCurrency, sourceCurrency) {
    if (!elements.comparisonRows) return;
    
    if (results.length === 0) {
        elements.comparisonRows.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-muted">
                    No providers available for the selected filter combination.
                </td>
            </tr>
        `;
        return;
    }
    
    elements.comparisonRows.innerHTML = results.map(provider => {
        // Badges HTML
        let badgesHtml = "";
        if (provider.isCheapest) {
            badgesHtml += `<span class="table-badge badge-cheapest">Cheapest</span>`;
        }
        if (provider.isFastest) {
            badgesHtml += `<span class="table-badge badge-fastest">Fastest</span>`;
        }
        if (provider.isWorst) {
            badgesHtml += `<span class="table-badge badge-worst">Expensive</span>`;
        }
        
        const feeFormatted = provider.fee.toFixed(2) + ` ${sourceCurrency}`;
        const rateFormatted = provider.rateOffered.toFixed(4);
        const receivesFormatted = provider.recipientReceives.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        const savingsText = provider.savings > 0 
            ? `<div class="provider-subtext text-success">Saves ~${provider.savings.toFixed(2)} ${destCurrency} vs banks</div>`
            : "";
            
        // Map methods array to styled list
        const methodsIcons = provider.methods.map(m => {
            if (m === "bank") return "🏦 Bank";
            if (m === "cash") return "💵 Cash";
            if (m === "wallet") return "📱 Wallet";
            return m;
        }).join(", ");
        
        return `
            <tr>
                <td>
                    <div class="provider-cell">
                        <div class="provider-logo" style="background-color: ${provider.logoColor}">
                            ${provider.logo}
                        </div>
                        <div>
                            <span class="provider-name">${provider.name}</span>
                            <div class="provider-subtext">${methodsIcons}</div>
                            <div class="badge-row">${badgesHtml}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <strong>1 : ${rateFormatted}</strong>
                    <div class="rate-markup">Markup: ~${provider.markupPercent}%</div>
                </td>
                <td>
                    <span>${feeFormatted}</span>
                </td>
                <td>
                    <span>${provider.speed}</span>
                </td>
                <td>
                    <span class="font-bold text-success text-sm">${receivesFormatted} ${destCurrency}</span>
                    ${savingsText}
                </td>
                <td>
                    <a href="${provider.website}" target="_blank" rel="noopener" class="btn btn-primary btn-sm flex align-center justify-center">
                        Send <i data-lucide="arrow-up-right" size="14" style="margin-left: 4px;"></i>
                    </a>
                </td>
            </tr>
        `;
    }).join("");
    
    // Initialize Lucide icons inside dynamic table elements
    lucide.createIcons();
}

// -------------------------------------------------------------
// Interactive Events & Polling
// -------------------------------------------------------------

/**
 * Initializes and schedules background polling to fetch fresh rates.
 */
function startPolling() {
    if (state.pollingInterval) {
        clearInterval(state.pollingInterval);
    }
    // Poll for rates every 60 seconds
    state.pollingInterval = setInterval(async () => {
        await fetchLatestRates(state.sourceCurrency);
        calculateComparison();
    }, 60000);
}

/**
 * Attaches event listeners to HTML elements.
 */
function initEvents() {
    // Input/Select change triggers
    elements.sendAmount.addEventListener("input", calculateComparison);
    
    elements.sourceCurrency.addEventListener("change", async () => {
        await fetchLatestRates(elements.sourceCurrency.value);
        calculateComparison();
    });
    
    elements.destCurrency.addEventListener("change", calculateComparison);
    
    // Swap Currencies Action
    elements.swapBtn.addEventListener("click", async () => {
        const temp = elements.sourceCurrency.value;
        elements.sourceCurrency.value = elements.destCurrency.value;
        elements.destCurrency.value = temp;
        
        // Fetch new rates for the new source currency
        await fetchLatestRates(elements.sourceCurrency.value);
        calculateComparison();
    });
    
    // Refresh Button
    elements.btnRefresh.addEventListener("click", async () => {
        // Query SVG or i since Lucide replaces the i tag with an SVG
        const refreshIcon = elements.btnRefresh.querySelector("svg") || elements.btnRefresh.querySelector("i");
        if (refreshIcon) refreshIcon.classList.add("spin");
        
        // Show loading state in the table body while refreshing
        if (elements.comparisonRows) {
            elements.comparisonRows.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="loader"></div>
                        <p class="mt-2 text-muted">Refreshing exchange rates...</p>
                    </td>
                </tr>
            `;
        }
        
        // Force bypass cache by clearing sessionStorage for this currency
        const base = elements.sourceCurrency.value;
        sessionStorage.removeItem(`rates_cache_${base}`);
        sessionStorage.removeItem(`rates_cache_time_${base}`);
        
        await fetchLatestRates(base);
        calculateComparison();
        
        setTimeout(() => {
            if (refreshIcon) refreshIcon.classList.remove("spin");
        }, 1000);
    });
    
    // Payout Filter Buttons
    elements.filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            elements.filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.payoutFilter = btn.getAttribute("data-method");
            calculateComparison();
        });
    });
    
    // Chart Timeframe Buttons
    elements.timeframeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            elements.timeframeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.timeframe = btn.getAttribute("data-range");
            calculateComparison();
        });
    });
    
    // Rate Alert Form Submit
    elements.rateAlertForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const targetRate = parseFloat(elements.alertTargetRate.value);
        const email = elements.alertEmail.value;
        
        // Mock save alerts to LocalStorage
        const alerts = JSON.parse(localStorage.getItem("rate_alerts") || "[]");
        alerts.push({
            pair: `${state.sourceCurrency}/${state.destCurrency}`,
            target: targetRate,
            email: email,
            created: Date.now()
        });
        localStorage.setItem("rate_alerts", JSON.stringify(alerts));
        
        // Visual Success feedback
        elements.alertMessage.classList.remove("hidden");
        
        setTimeout(() => {
            elements.alertMessage.classList.add("hidden");
            elements.rateAlertForm.reset();
            elements.alertTargetRate.value = (state.rates[state.destCurrency] * 1.02).toFixed(2);
        }, 3000);
    });
}

// -------------------------------------------------------------
// App Bootstrap
// -------------------------------------------------------------

async function init() {
    // Initial Icon replacement
    lucide.createIcons();
    
    // Attach Listeners
    initEvents();
    
    // Fetch rates and render initial calculations
    await fetchLatestRates(state.sourceCurrency);
    calculateComparison();
    
    // Start live auto-polling
    startPolling();
}

window.addEventListener("DOMContentLoaded", init);
