//bewegende background
var container = document.querySelector('.custom-container');

container.addEventListener('mousemove', function (e) {
    var x = e.clientX / window.innerWidth - 0.5;
    var y = e.clientY / window.innerHeight - 0.5;

    container.style.setProperty('--x', x * 100 + '%');
    container.style.setProperty('--y', y * 100 + '%');
});
    
    // Gegevens zijn opgehaald van een REST API en ingevult in de vervolgkeuzelijst (dropdown).
const populateCryptoDropdown = async () => {
    const accessKey = 'd14efbf89d56283c1b6ea4a0fd6015fb'; 
    const symbolsUrl = `http://api.coinlayer.com/list?expand=1&access_key=${accessKey}`;

    try {
        const response = await fetch(symbolsUrl);
        const data = await response.json();

        localStorage.setItem('cryptoData', JSON.stringify(data));
        updateCryptoDropdown(data);
    } catch (error) {
        console.error('Error fetching cryptocurrency list:', error);
    }
};

// Functie voor de update van de cryptocurrency dropdown
const updateCryptoDropdown = (data) => {
    const cryptoSelect = document.getElementById('cryptoSelect');
    cryptoSelect.innerHTML = "";
    let count = 0;

    for (const [symbol, details] of Object.entries(data.crypto)) {
        const option = document.createElement('option');
        option.value = symbol;
        option.text = `${symbol} - ${details.name}`;
        cryptoSelect.add(option);

        count++;
        if (count >= 25) {
            break;
        }
    }
};

// Event listener voor de "Check Rate" button
document.getElementById('checkRateButton').addEventListener('click', async () => {
    const selectedSymbol = document.getElementById('cryptoSelect').value;
    const accessKey = 'd14efbf89d56283c1b6ea4a0fd6015fb';
    const currentDate = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const formattedYesterdayDate = yesterdayDate.toISOString().split('T')[0];
    const url = `http://api.coinlayer.com/${currentDate}?access_key=${accessKey}&symbols=${selectedSymbol}`;
    const yesterdayUrl = `http://api.coinlayer.com/${formattedYesterdayDate}?access_key=${accessKey}&symbols=${selectedSymbol}`;

    try {
        console.log('Fetching current rates...');
        const response = await fetch(url);
        const data = await response.json();

        //console.log('Current rates data:', data);

        if (data.success) {
            const todayRate = data.rates[selectedSymbol];
            const yesterdayResponse = await fetch(yesterdayUrl);
            const yesterdayData = await yesterdayResponse.json();
            const yesterdayRate = yesterdayData.rates[selectedSymbol];

            if (todayRate !== undefined && yesterdayRate !== undefined) {
                //console.log('Today rate:', todayRate);
                //console.log('Yesterday rate:', yesterdayRate);

                const rateChange = todayRate - yesterdayRate;
                const resultRatesElement = document.getElementById('resultRates');
                resultRatesElement.innerHTML = `<h5>Huidige rate van  ${selectedSymbol}:</h5> <p class="${rateChange >= 0 ? 'rate-increase' : 'rate-decrease'}">${todayRate}</p>`;

                // Add the "Add to Favorites" button
                const addFavButton = document.createElement('button');
                addFavButton.id = 'addFavButton';
                addFavButton.textContent = 'Favo';
                addFavButton.addEventListener('click', () => {
                    // Add your logic to handle adding to favorites
                    addToFavorites(selectedSymbol);
                    updateFavoriteCurrenciesDisplay();
                });
                resultRatesElement.appendChild(addFavButton);

            } else {
                document.getElementById('resultRates').innerHTML = 'Error: Rate data not found in the API response.';
            }
        } else {
            document.getElementById('resultRates').innerHTML = 'Error: ' + data.error.info;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('resultRates').innerHTML = 'Error fetching data. Check the console for details.';
    }
});

// Function to add a currency to favorites
const addToFavorites = () => {
    // Get the selected currency symbol from the dropdown
    const selectedSymbol = document.getElementById('cryptoSelect').value;

    // Retrieve existing favorite currencies from local storage
    let storedCurrencies = localStorage.getItem('favoriteCurrencies');
    let existingFavorites;

    if (storedCurrencies) {
        existingFavorites = JSON.parse(storedCurrencies);

        // Check if the currency is already in the favorites list
        const isDuplicate = existingFavorites.some(currency => currency.symbol === selectedSymbol);

        if (isDuplicate) {
            alert('Currency already in your favorites');
            return;
        }
    } else {
        existingFavorites = [];
    }

    // Add the new currency to the array of favorites
    existingFavorites.push({ symbol: selectedSymbol });

    // Store in local storage
    localStorage.setItem('favoriteCurrencies', JSON.stringify(existingFavorites));

    // Refresh the display of favorite currencies
    updateFavoriteCurrenciesDisplay();
};

// Function to delete a currency from favorites
const deleteFromFavorites = (index) => {
    // Retrieve existing favorite currencies from local storage
    let storedCurrencies = localStorage.getItem('favoriteCurrencies');
    let existingFavorites;

    if (storedCurrencies) {
        existingFavorites = JSON.parse(storedCurrencies);
        existingFavorites.splice(index, 1);

        // Store the updated favorites in local storage
        localStorage.setItem('favoriteCurrencies', JSON.stringify(existingFavorites));

        // Refresh the display of favorite currencies
        updateFavoriteCurrenciesDisplay();
    }
};

// Function to display favorite currencies
const updateFavoriteCurrenciesDisplay = () => {
    // Retrieve existing favorite currencies from local storage
    const storedCurrencies = localStorage.getItem('favoriteCurrencies');
    let existingFavorites;
    if (storedCurrencies) {
        existingFavorites = JSON.parse(storedCurrencies);
    } else {
        existingFavorites = [];
    }

    // Log the length of existingFavorites to help with debugging
    console.log('Number of existing favorites:', existingFavorites.length);

    // Clear the content of the favorites container
    const favoritesContainer = document.querySelector('.searchBarSelectFav');
    favoritesContainer.innerHTML = "";

    if (existingFavorites.length > 0) {
        // If there are favorite currencies, create elements to display them
        const favoritesList = document.createElement('ul');

        existingFavorites.forEach((currency, index) => {

            favoritesContainer.innerHTML += `
                <div class="badge bg-dark p-2 m-1">
                ${currency.symbol} 
                    <span class="deleteBtn" onclick="deleteFromFavorites(${index})">x</span>
                </div>`;
        });

        // Append the favorites list to the container
        favoritesContainer.appendChild(favoritesList);
    } else {
        // If there are no favorite currencies, display a message
        favoritesContainer.innerHTML = '⇎ empty';
    }
};

//Dit is allemaal voor de onderster data op de website - Top 5
const appendRowToTable = (tableBody, data) => {
    const row = document.createElement('tr');
    
    for (const value of data) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
    }
    tableBody.appendChild(row);
};


const getTop5CryptosByMaxSupply = (dataCrypto) => {
    const cryptoArray = Object.values(dataCrypto);
    //Sorteert de  cryptocurrencies van max_supply in descending order
    const sortedCryptos = cryptoArray.sort((a, b) => b.max_supply - a.max_supply);
    // Get the top 5
    const top5Cryptos = sortedCryptos.slice(0, 5);
    return top5Cryptos;
};

//Functie om de top 5 crypto rates te bekijken
const checkTop5CryptoRates = async () => {
    const accessKey = 'd14efbf89d56283c1b6ea4a0fd6015fb';
    const top5Url = `http://api.coinlayer.com/list?expand=1&access_key=${accessKey}`;

    try {
        console.log('Fetching top 5 data...');
        const listResponse = await fetch(top5Url);
        const listData = await listResponse.json();

        if (listData.success) {
            const cryptoRateBody = document.getElementById('cryptoRateBody');
            cryptoRateBody.innerHTML = "";

            const cryptoArray = Object.values(listData.crypto);
            const top5Cryptos = cryptoArray.slice(0, 5);

            //Creëert rows voor elke cryptocurrency
            for (const [index, crypto] of top5Cryptos.entries()) {
                const symbol = crypto.symbol;
                const todayUrl = `http://api.coinlayer.com/live?access_key=${accessKey}&symbols=${symbol}`;
                const yesterdayUrl = `http://api.coinlayer.com/${formattedYesterdayDate}?access_key=${accessKey}&symbols=${symbol}`;

                try {
                    const todayResponse = await fetch(todayUrl);
                    const todayData = await todayResponse.json();

                    const yesterdayResponse = await fetch(yesterdayUrl);
                    const yesterdayData = await yesterdayResponse.json();

                    if (todayData.success && yesterdayData.success) {
                        const todayRate = todayData.rates[symbol];
                        const yesterdayRate = yesterdayData.rates[symbol];

                        //console.log('Today rate:', todayRate);
                        //console.log('Yesterday rate:', yesterdayRate);

                        if (!isNaN(todayRate) && yesterdayRate !== undefined && yesterdayRate !== null && !isNaN(yesterdayRate) && yesterdayRate !== 0) {
                            //Calculeert de verschil in percentage
                            const percentageChange = ((todayRate - yesterdayRate) / yesterdayRate) * 100;

                            //console.log('Percentage change:', percentageChange);

                            const rowData = [
                                `♢ ${index + 1}`,
                                crypto.name,
                                '€ ' + todayRate.toFixed(2),
                                crypto.max_supply,
                                percentageChange.toFixed(2) + '%'
                            ];

                            appendRowToTable(cryptoRateBody, rowData);
                        } else {
                            console.error('Error: Invalid rate data for crypto:', crypto);
                        }
                    } else {
                        console.error('Error fetching rates for crypto:', symbol);
                    }
                } catch (error) {
                    console.error('Error fetching rates for crypto:', symbol, error);
                }
            }
        } else {
            console.error('Error fetching top 5 cryptocurrencies:', listData.error.info);
        }
    } catch (error) {
        console.error('Error fetching top 5 cryptocurrencies:', error);
    }
};


// Function to generate shareable content for favorites
const generateShareableContent = () => {
    // Retrieve existing favorite currencies from local storage
    const storedCurrencies = localStorage.getItem('favoriteCurrencies');
    let existingFavorites;

    if (storedCurrencies) {
        existingFavorites = JSON.parse(storedCurrencies);
    } else {
        existingFavorites = [];
    }

    // Create a string with the favorite currencies
    const favoritesString = existingFavorites.map(currency => currency.symbol).join(', ');

    return `My favorite currencies: ${favoritesString}`;
};

// Function to share on Instagram
const shareOnInstagram = () => {
    const shareContent = generateShareableContent();

    // Implement Instagram sharing logic here
    // You may need to use the Instagram API or open the Instagram app if on a mobile device
    console.log('Sharing on Instagram:', shareContent);
};

// Function to share on Facebook
const shareOnFacebook = () => {
    const shareContent = generateShareableContent();

    // Implement Facebook sharing logic here
    // You can use the Facebook SDK or open the Facebook sharing dialog
    console.log('Sharing on Facebook:', shareContent);
};

// Function to share on Twitter
const shareOnTwitter = () => {
    const shareContent = generateShareableContent();

    // Implement Twitter sharing logic here
    // You can use the Twitter API or open the Twitter sharing dialog
    console.log('Sharing on Twitter:', shareContent);
};

// Example: Add event listeners to trigger sharing functions
document.getElementById('shareInstagramButton').addEventListener('click', shareOnInstagram);
document.getElementById('shareFacebookButton').addEventListener('click', shareOnFacebook);
document.getElementById('shareTwitterButton').addEventListener('click', shareOnTwitter);
//Initiële populatie van de dropdown en controle van de top 5 cryptotarieven    (async () => {
document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        console.log('Calling populateCryptoDropdown');
        await populateCryptoDropdown();
        console.log('populateCryptoDropdown completed');

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        formattedYesterdayDate = yesterdayDate.toISOString().split('T')[0];

        console.log('Calling checkTop5CryptoRates');
        await checkTop5CryptoRates();
        console.log('checkTop5CryptoRates completed');

        updateFavoriteCurrenciesDisplay();
    })();
});

//light en dark modus - checked ook wat de voorkeur is van de gebruiker
document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;
    const searchBar = document.querySelector('.searchBar');
    const cryptoSelector = document.querySelector('.cryptoSelector');

    // Check the user's preferred theme
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme based on user preference
    if (prefersDarkMode) {
        setDarkMode();
    }

    // Toggle between light and dark mode
    themeToggleBtn.addEventListener('click', function () {
        if (body.classList.contains('light-mode')) {
            setDarkMode();
        } else {
            setLightMode();
        }
    });

    function setDarkMode() {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        searchBar.classList.remove('light-mode');
        searchBar.classList.add('dark-mode');
        cryptoSelector.classList.remove('light-mode');
        cryptoSelector.classList.add('dark-mode');
        themeToggleBtn.textContent = 'Light Mode';
    }

    function setLightMode() {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        searchBar.classList.remove('dark-mode');
        searchBar.classList.add('light-mode');
        cryptoSelector.classList.remove('dark-mode');
        cryptoSelector.classList.add('light-mode');
        themeToggleBtn.textContent = 'Dark Mode';
    }
});