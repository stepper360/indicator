// Configuration
const APP_ID = 86038;
const MARKETS = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100'];
const PING_INTERVAL = 10000;
const RECONNECT_DELAY = 1000;

// Data structures
const digits = {
    R_10: [],
    R_25: [],
    R_50: [],
    R_75: [],
    R_100: []
};

const consecutiveCounts = {
    R_10: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    R_25: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    R_50: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    R_75: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    R_100: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0}
};

const maxStreaks = {
    R_10: { odd: 0, even: 0 },
    R_25: { odd: 0, even: 0 },
    R_50: { odd: 0, even: 0 },
    R_75: { odd: 0, even: 0 },
    R_100: { odd: 0, even: 0 }
};

const quotes = {
    R_10: [],
    R_25: [],
    R_100: []
};

// Trigger lists for trade simulation
const triggerLists = {
    R_10: [0.000, 0.020, 0.040, 0.060, 0.080, 0.202, 0.222, 0.262, 0.282, 0.404, 0.424, 0.444, 0.464, 0.484, 0.606, 0.626, 0.666, 0.686, 0.808, 0.828, 0.848, 0.868, 0.888],
    R_25: [0.000, 0.020, 0.040, 0.060, 0.080, 0.202, 0.222, 0.262, 0.282, 0.404, 0.424, 0.444, 0.464, 0.484, 0.606, 0.626, 0.666, 0.686, 0.808, 0.828, 0.848, 0.868, 0.888],
    R_100: [0.00, 0.22, 0.44, 0.66, 0.88]
};

// Simulation and trading state
const simulationState = {};
['R_10', 'R_25', 'R_100'].forEach(market => {
    simulationState[market] = {
        box_value: 0,
        isActive: true,
        currentStep: 0,
        pendingTrade: false,
        waitingForTrigger: true,
        tradeOutcomes: [],
        riseWins: 0,
        fallWins: 0,
        riseLosses: 0,
        fallLosses: 0,
        totalTrades: 0,
        triggerDigits: {},
        levelCounts: {},
        lastAppearanceTimes: {},
        currentLevel: null,
        // New properties for real trading
        isTrading: false,
        contractType: null,
        currentMartingaleStep: 0,
        pendingContract: false,
        stakeAmounts: [0.35, 0.40, 0.80, 1.65, 3.40]
    };
    for (let i = 1; i <= 12; i++) {
        simulationState[market].levelCounts[`above${i}`] = 0;
        simulationState[market].levelCounts[`below${i}`] = 0;
        simulationState[market].lastAppearanceTimes[`above${i}`] = null;
        simulationState[market].lastAppearanceTimes[`below${i}`] = null;
    }
});

// Global balance tracking
let currentBalance = 0;

// WebSocket setup
let ws = null;
let realAccountWS = null;
let pingTimer = null;
let reconnectInterval = 1000;

const expectedProfit = 1000;
const maxAcceptableLoss = 1000;

function getCurrentStreak(symbol) {
    const outcomes = simulationState[symbol].tradeOutcomes;
    if (outcomes.length === 0) return { type: null, count: 0 };
    const lastOutcome = outcomes[outcomes.length - 1];
    let count = 1;
    for (let i = outcomes.length - 2; i >= 0; i--) {
        if (outcomes[i] === lastOutcome) count++;
        else break;
    }
    return { type: lastOutcome, count: count };
}

function drawGraph(symbol) {
    const marketId = symbol.split('_')[1];
    const svg = document.getElementById(`graph${marketId}`);
    svg.innerHTML = '';

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", "10"); yAxis.setAttribute("y1", "10");
    yAxis.setAttribute("x2", "10"); yAxis.setAttribute("y2", "290");
    yAxis.setAttribute("stroke", "black"); yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    const middleLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    middleLine.setAttribute("x1", "10"); middleLine.setAttribute("y1", "150");
    middleLine.setAttribute("x2", "190"); middleLine.setAttribute("y2", "150");
    middleLine.setAttribute("stroke", "black"); middleLine.setAttribute("stroke-width", "2");
    svg.appendChild(middleLine);

    const spacing = 12;
    for (let i = 1; i <= 12; i++) {
        const yAbove = 150 - spacing * i;
        const lineAbove = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineAbove.setAttribute("x1", "10"); lineAbove.setAttribute("y1", yAbove);
        lineAbove.setAttribute("x2", "190"); lineAbove.setAttribute("y2", yAbove);
        lineAbove.setAttribute("stroke", "gray"); lineAbove.setAttribute("stroke-width", "1");
        svg.appendChild(lineAbove);

        const textAbove = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textAbove.setAttribute("x", "5"); textAbove.setAttribute("y", yAbove + 5);
        textAbove.setAttribute("text-anchor", "end"); textAbove.setAttribute("font-size", "10");
        textAbove.textContent = i.toString();
        svg.appendChild(textAbove);

        const countAbove = document.createElementNS("http://www.w3.org/2000/svg", "text");
        countAbove.setAttribute("id", `countAbove${i}_${marketId}`);
        countAbove.setAttribute("x", "195"); countAbove.setAttribute("y", yAbove + 5);
        countAbove.setAttribute("text-anchor", "start"); countAbove.setAttribute("font-size", "10");
        countAbove.textContent = "0";
        svg.appendChild(countAbove);

        const timeAbove = document.createElementNS("http://www.w3.org/2000/svg", "text");
        timeAbove.setAttribute("id", `timeAbove${i}_${marketId}`);
        timeAbove.setAttribute("x", "205"); timeAbove.setAttribute("y", yAbove + 5);
        timeAbove.setAttribute("text-anchor", "start"); timeAbove.setAttribute("font-size", "10");
        timeAbove.setAttribute("fill", "red"); timeAbove.textContent = "00:00:00";
        svg.appendChild(timeAbove);

        const yBelow = 150 + spacing * i;
        const lineBelow = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineBelow.setAttribute("x1", "10"); lineBelow.setAttribute("y1", yBelow);
        lineBelow.setAttribute("x2", "190"); lineBelow.setAttribute("y2", yBelow);
        lineBelow.setAttribute("stroke", "gray"); lineBelow.setAttribute("stroke-width", "1");
        svg.appendChild(lineBelow);

        const textBelow = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textBelow.setAttribute("x", "5"); textBelow.setAttribute("y", yBelow + 5);
        textBelow.setAttribute("text-anchor", "end"); textBelow.setAttribute("font-size", "10");
        textBelow.textContent = i.toString();
        svg.appendChild(textBelow);

        const countBelow = document.createElementNS("http://www.w3.org/2000/svg", "text");
        countBelow.setAttribute("id", `countBelow${i}_${marketId}`);
        countBelow.setAttribute("x", "195"); countBelow.setAttribute("y", yBelow + 5);
        countBelow.setAttribute("text-anchor", "start"); countBelow.setAttribute("font-size", "10");
        countBelow.textContent = "0";
        svg.appendChild(countBelow);

        const timeBelow = document.createElementNS("http://www.w3.org/2000/svg", "text");
        timeBelow.setAttribute("id", `timeBelow${i}_${marketId}`);
        timeBelow.setAttribute("x", "205"); timeBelow.setAttribute("y", yBelow + 5);
        timeBelow.setAttribute("text-anchor", "start"); timeBelow.setAttribute("font-size", "10");
        timeBelow.setAttribute("fill", "red"); timeBelow.textContent = "00:00:00";
        svg.appendChild(timeBelow);
    }

    const redLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    redLine.setAttribute("x1", "10"); redLine.setAttribute("y1", "150");
    redLine.setAttribute("x2", "190"); redLine.setAttribute("y2", "150");
    redLine.setAttribute("stroke", "red"); redLine.setAttribute("stroke-width", "2");
    redLine.id = `redLine${marketId}`;
    svg.appendChild(redLine);
}

function isTriggerQuote(symbol, quote, pip_size) {
    const triggerList = triggerLists[symbol];
    if (!triggerList) return false;
    const quoteStr = quote.toFixed(pip_size);
    const decimalPart = quoteStr.split('.')[1] || '';
    return triggerList.some(trigger => {
        const triggerStr = trigger.toFixed(pip_size);
        const triggerDecimal = triggerStr.split('.')[1] || '';
        return decimalPart === triggerDecimal.padEnd(pip_size, '0');
    });
}

function updateQuoteUI(symbol) {
    const marketId = symbol.split('_')[1];
    const triangles = document.querySelectorAll(`#quoteContainer${marketId} .triangles .triangle`);
    const quoteBoxes = document.querySelectorAll(`#quoteContainer${marketId} .quotes .quoteBox`);
    const marketQuotes = quotes[symbol];

    triangles.forEach((triangle, index) => {
        if (index < marketQuotes.length - 1) {
            const currentQ = marketQuotes[index];
            const nextQ = marketQuotes[index + 1];
            triangle.className = currentQ.quote > nextQ.quote ? 'triangle triangle-up' : 
                                 currentQ.quote < nextQ.quote ? 'triangle triangle-down' : 'triangle';
        } else triangle.className = 'triangle';
    });

    quoteBoxes.forEach((quoteBox, index) => {
        if (index < marketQuotes.length) {
            const q = marketQuotes[index];
            quoteBox.textContent = q.quote.toFixed(q.pip_size);
            quoteBox.style.color = q.isTrigger ? 'red' : 'black';
        } else quoteBox.textContent = '';
    });
}

function updateBalanceUI(symbol) {
    const marketId = symbol.split('_')[1];
    const state = simulationState[symbol];
    if (state) {
        const initialBalance = 2100;
        const currentBalance = initialBalance + state.box_value;
        const balanceElement = document.getElementById(`balance${marketId}`);
        if (balanceElement) balanceElement.textContent = `Balance: $${currentBalance.toFixed(2)}`;
    }
}

function updateAnalysisUI(symbol) {
    const marketId = symbol.split('_')[1];
    const state = simulationState[symbol];
    document.getElementById(`riseWin${marketId}`).textContent = state.riseWins;
    document.getElementById(`fallWin${marketId}`).textContent = state.fallWins;
    document.getElementById(`riseLoss${marketId}`).textContent = state.riseLosses;
    document.getElementById(`fallLoss${marketId}`).textContent = state.fallLosses;
    document.getElementById(`totalTrades${marketId}`).textContent = state.totalTrades;

    let maxCount = 0, commonDigit = '';
    for (const [digit, count] of Object.entries(state.triggerDigits)) {
        if (count > maxCount) {
            maxCount = count;
            commonDigit = digit;
        }
    }
    document.getElementById(`commonTriggers${marketId}`).textContent = commonDigit || 'N/A';
}

function connectWebSocket() {
    try {
        ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);
        ws.onerror = handleError;
        ws.onopen = () => {
            console.log('WebSocket connection opened.');
            startPingInterval();
            subscribeToMarkets();
            initializeUI();
            reconnectInterval = 1000;
        };
        ws.onclose = handleClose;
        ws.onmessage = handleMessage;
    } catch (error) {
        console.error('Connection error:', error);
        setTimeout(connectWebSocket, reconnectInterval);
        reconnectInterval = Math.min(reconnectInterval + 1000, 10000);
    }
}

function loginToDeriv(token) {
    if (realAccountWS) realAccountWS.close();
    realAccountWS = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);
    realAccountWS.onopen = () => {
        realAccountWS.send(JSON.stringify({ authorize: token }));
    };
    realAccountWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.authorize) {
            document.getElementById('loginStatus').textContent = `Logged in as: ${data.authorize.loginid}`;
            document.getElementById('loginStatus').style.color = 'green';
            realAccountWS.send(JSON.stringify({ "balance": 1, "subscribe": 1 }));
        }  if (data.error) {
            document.getElementById('loginStatus').textContent = `Login failed: ${data.error.message}`;
            document.getElementById('loginStatus').style.color = 'red';
        } else if (data.balance) {
            currentBalance = data.balance.balance;
            document.getElementById('accountBalance').textContent = currentBalance.toFixed(2);
        }
    };
    realAccountWS.onerror = () => {
        document.getElementById('loginStatus').textContent = 'WebSocket error';
        document.getElementById('loginStatus').style.color = 'red';
    };
    realAccountWS.onclose = () => {
        document.getElementById('loginStatus').textContent = 'Connection closed';
        document.getElementById('loginStatus').style.color = 'orange';
    };
}

function handleMessage(event) {
    const data = JSON.parse(event.data);
    if (data.tick) processTickData(data.tick);
    else if (data.error) console.error('API error:', data.error);
}

function processTickData(tick) {
    const { symbol, quote, pip_size = 2 } = tick;
    const lastDigit = Math.floor(quote * 10 ** pip_size) % 10;
    const newDigit = { value: lastDigit, consecutive: false };
    const symbolDigits = digits[symbol];

    if (symbolDigits.length > 0) {
        const prevDigit = symbolDigits[symbolDigits.length - 1];
        if (prevDigit.value === newDigit.value) {
            prevDigit.consecutive = true;
            newDigit.consecutive = true;
        }
    }

    symbolDigits.push(newDigit);
    if (symbolDigits.length > 100) symbolDigits.shift();

    if (symbol === 'R_10' || symbol === 'R_25' || symbol === 'R_100') {
        const isTrigger = isTriggerQuote(symbol, quote, pip_size);
        quotes[symbol].unshift({ quote: quote, pip_size: pip_size, isTrigger: isTrigger });
        if (quotes[symbol].length > 4) quotes[symbol].pop();
        updateQuoteUI(symbol);
    }

    updateUI(symbol, quote);
    updateConsecutiveCounts(symbol, lastDigit);
    updateStreakCount(symbol, lastDigit);

    if (symbol === 'R_10' || symbol === 'R_25' || symbol === 'R_100') {
        const state = simulationState[symbol];
        if (state && state.isActive) {
            if (state.pendingTrade) {
                let isWin = lastDigit % 2 !== 0;
                processTradeOutcome(symbol, isWin);
                state.tradeOutcomes.push(isWin ? 'win' : 'loss');
                state.totalTrades += 1;
                state.triggerDigits[lastDigit] = (state.triggerDigits[lastDigit] || 0) + 1;

                if (isWin) {
                    if (state.triggerDirection === 'rise') state.riseWins += 1;
                    else if (state.triggerDirection === 'fall') state.fallWins += 1;
                } else {
                    if (state.triggerDirection === 'rise') state.riseLosses += 1;
                    else if (state.triggerDirection === 'fall') state.fallLosses += 1;
                }

                const streak = getCurrentStreak(symbol);
                const marketId = symbol.split('_')[1];
                const redLine = document.getElementById(`redLine${marketId}`);
                if (redLine) {
                    let y;
                    if (streak.type === 'loss') {
                        const count = Math.min(streak.count, 12);
                        y = 150 - 12 * count;
                    } else if (streak.type === 'win') {
                        const count = Math.min(streak.count, 12);
                        y = 150 + 12 * count;
                    } else y = 150;
                    redLine.setAttribute("y1", y);
                    redLine.setAttribute("y2", y);

                    let currentLevel = null;
                    if (y < 150) {
                        const count = Math.round((150 - y) / 12);
                        if (count >= 1 && count <= 12) currentLevel = `above${count}`;
                    } else if (y > 150) {
                        const count = Math.round((y - 150) / 12);
                        if (count >= 1 && count <= 12) currentLevel = `below${count}`;
                    }

                    if (currentLevel && currentLevel !== state.currentLevel) {
                        state.levelCounts[currentLevel] += 1;
                        state.lastAppearanceTimes[currentLevel] = new Date().getTime();
                        const countElementId = currentLevel.startsWith('above') ? 
                            `countAbove${currentLevel.slice(5)}_${marketId}` : 
                            `countBelow${currentLevel.slice(5)}_${marketId}`;
                        document.getElementById(countElementId).textContent = state.levelCounts[currentLevel];
                    }
                    state.currentLevel = currentLevel;

                    if (symbol === 'R_10' || symbol === 'R_25') {
                        if (streak.count === 6 && !Object.values(simulationState).some(s => s.isTrading)) {
                            state.contractType = streak.type === 'loss' ? 'odd' : 'even';
                            state.isTrading = true;
                            state.currentMartingaleStep = 0;
                            document.getElementById(`v${marketId}Status`).textContent = 'trading';
                        }
                    }
                }
                updateSimulationUI(symbol);
                updateAnalysisUI(symbol);
                state.pendingTrade = false;

                if (isWin) {
                    state.currentStep = 0;
                    state.waitingForTrigger = true;
                } else {
                    if (state.currentStep < 11) state.currentStep += 1;
                    state.waitingForTrigger = true;
                }
            }

            if (state.waitingForTrigger && isTriggerQuote(symbol, quote, pip_size)) {
                state.pendingTrade = true;
                state.waitingForTrigger = false;
                if (quotes[symbol].length >= 2) {
                    const currentQuote = quotes[symbol][0].quote;
                    const previousQuote = quotes[symbol][1].quote;
                    state.triggerDirection = currentQuote > previousQuote ? 'rise' : 
                                            (currentQuote < previousQuote ? 'fall' : 'neutral');
                } else state.triggerDirection = 'unknown';
            }

            if (symbol === 'R_10' || symbol === 'R_25') {
                if (state.isTrading && isTriggerQuote(symbol, quote, pip_size)) {
                    const stake = state.stakeAmounts[state.currentMartingaleStep];
                    const contractType = state.contractType === 'odd' ? 'DIGITODD' : 'DIGITEVEN';
                    if (realAccountWS && realAccountWS.readyState === WebSocket.OPEN) {
                        const buyRequest = {
                            "buy": 1,
                            "price": stake,
                            "parameters": {
                                "contract_type": contractType,
                                "symbol": symbol,
                                "duration": 1,
                                "duration_unit": "t",
                                "basis": "stake",
                                "amount": stake,
                                "currency": "USD"
                            }
                        };
                        realAccountWS.send(JSON.stringify(buyRequest));
                        state.pendingContract = true;
                    }
                }

                if (state.pendingContract) {
                    const isOdd = lastDigit % 2 === 1;
                    const isWin = (state.contractType === 'odd' && isOdd) || (state.contractType === 'even' && !isOdd);
                    const stake = state.stakeAmounts[state.currentMartingaleStep];
                    if (isWin) {
                        currentBalance += stake * 0.9; // Simulated payout
                        state.isTrading = false;
                        state.currentMartingaleStep = 0;
                        document.getElementById(`v${marketId}Status`).textContent = 'idle';
                    } else {
                        currentBalance -= stake;
                        if (state.currentMartingaleStep < 4) state.currentMartingaleStep += 1;
                    }
                    state.pendingContract = false;
                    document.getElementById('accountBalance').textContent = currentBalance.toFixed(2);
                }
            }
        }
    }
}

function updateStreakCount(symbol, digit) {
    const isEven = digit % 2 === 0;
    const digitsArray = digits[symbol];
    let currentStreak = 1;

    for (let i = digitsArray.length - 2; i >= 0; i--) {
        const prevDigit = digitsArray[i].value;
        if ((isEven && prevDigit % 2 === 0) || (!isEven && prevDigit % 2 !== 0)) currentStreak++;
        else break;
    }

    const marketId = symbol.split('_')[1];
    if (isEven) {
        if (currentStreak > maxStreaks[symbol].even) {
            maxStreaks[symbol].even = currentStreak;
            document.getElementById(`maxConsecutiveEven${marketId}`).textContent = currentStreak;
        }
    } else {
        if (currentStreak > maxStreaks[symbol].odd) {
            maxStreaks[symbol].odd = currentStreak;
            document.getElementById(`maxConsecutiveOdd${marketId}`).textContent = currentStreak;
        }
    }
}

function updateUI(symbol, quote) {
    const marketId = symbol.split('_')[1];
    updateTable(`table${marketId}`, digits[symbol], quote);
}

function updateTable(tableId, digitsArray, quote) {
    const table = document.getElementById(tableId);
    if (table) {
        const cells = table.getElementsByTagName('td');
        digitsArray.slice(-100).reverse().forEach((digitObj, index) => {
            if (index < 100) {
                const cell = cells[index];
                if (cell) { // Check if the cell exists before updating
                    cell.textContent = digitObj.value;
                    cell.classList.toggle('consecutive', digitObj.consecutive);
                }
            }
        });
    } else {
        console.warn(`Table with ID ${tableId} not found.`);
    }
}

function updateConsecutiveCounts(symbol, lastDigit) {
    let currentStreak = 1;
    const digitsArray = digits[symbol];

    for (let i = digitsArray.length - 1; i > 0; i--) {
        if (digitsArray[i].value === digitsArray[i - 1].value && digitsArray[i].value === lastDigit) currentStreak++;
        else break;
    }

    if (currentStreak > consecutiveCounts[symbol][lastDigit]) {
        consecutiveCounts[symbol][lastDigit] = currentStreak;
        updateConsecutiveUI(symbol, lastDigit);
    }
}

function updateConsecutiveUI(symbol, digit) {
    const marketId = symbol.split('_')[1];
    document.getElementById(`consecutive${marketId}_${digit}`).textContent = consecutiveCounts[symbol][digit];
}

function startPingInterval() {
    pingTimer = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ping: 1 }));
    }, PING_INTERVAL);
}

function handleClose(event) {
    console.warn(`Connection closed: ${event.reason || 'Unknown reason'}`);
    clearInterval(pingTimer);
    setTimeout(connectWebSocket, reconnectInterval);
    reconnectInterval = Math.min(reconnectInterval + 1000, 10000);
}

function handleError(event) {
    console.error('WebSocket error:', event);
    if (ws) ws.close();
    setTimeout(connectWebSocket, reconnectInterval);
    reconnectInterval = Math.min(reconnectInterval + 1000, 10000);
}

function subscribeToMarkets() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        MARKETS.forEach(market => ws.send(JSON.stringify({ ticks: market })));
    } else console.warn('WebSocket is not open.');
}

function initializeUI() {
    MARKETS.forEach(symbol => {
        const marketId = symbol.split('_')[1];
        updateTable(`table${marketId}`, digits[symbol]);
        for (let digit = 0; digit <= 9; digit++) updateConsecutiveUI(symbol, digit);
    });
    ['R_10', 'R_25', 'R_100'].forEach(symbol => {
        const marketId = symbol.split('_')[1];
        const accumulationElement = document.getElementById(`accumulation${marketId}`);
        if (accumulationElement) accumulationElement.textContent = `$0.00`;
        updateBalanceUI(symbol);
        drawGraph(symbol);
        updateAnalysisUI(symbol);
    });
}

function processTradeOutcome(symbol, isWin) {
    const state = simulationState[symbol];
    if (!state.isActive) return;

    const currentStep = state.currentStep;
    const stake = state.stakeAmounts[currentStep];
    const payout = stake * 0.9; // Simulated payout factor

    if (isWin) {
        state.box_value += payout;
        console.log(`${symbol}: WIN - Payout: $${payout}, New Balance: $${2100 + state.box_value}`);
    } else {
        state.box_value -= stake;
        console.log(`${symbol}: LOSS - Stake: $${stake}, New Balance: $${2100 + state.box_value}`);
    }

    updateBalanceUI(symbol);

    const totalProfit = Object.values(simulationState).reduce((sum, state) => sum + state.box_value, 0);
    if (totalProfit >= expectedProfit) {
        console.log(`Done! Total Profit: $${totalProfit}`);
        Object.values(simulationState).forEach(state => state.isActive = false);
    } else if (totalProfit <= -maxAcceptableLoss) {
        console.log(`Max loss reached: $${totalProfit}.`);
        Object.values(simulationState).forEach(state => state.isActive = false);
    }
}

function updateSimulationUI(symbol) {
    if (symbol === 'R_10' || symbol === 'R_25' || symbol === 'R_100') {
        const marketId = symbol.split('_')[1];
        const accumulationElement = document.getElementById(`accumulation${marketId}`);
        if (accumulationElement) accumulationElement.textContent = `$${simulationState[symbol].box_value.toFixed(2)}`;
    }
}

function updateTimeDisplays() {
    const now = new Date().getTime();
    ['R_10', 'R_25', 'R_100'].forEach(market => {
        const marketId = market.split('_')[1];
        const state = simulationState[market];
        for (let i = 1; i <= 12; i++) {
            ['above', 'below'].forEach(position => {
                const level = `${position}${i}`;
                const timeElement = document.getElementById(`time${position.charAt(0).toUpperCase() + position.slice(1)}${i}_${marketId}`);
                if (timeElement) {
                    if (level === state.currentLevel) timeElement.textContent = '00:00:00';
                    else {
                        const lastTime = state.lastAppearanceTimes[level];
                        if (lastTime) {
                            const elapsed = Math.floor((now - lastTime) / 1000);
                            const hours = Math.floor(elapsed / 3600);
                            const minutes = Math.floor((elapsed % 3600) / 60);
                            const secs = elapsed % 60;
                            timeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                        } else timeElement.textContent = '00:00:00';
                    }
                }
            });
        }
    });
}

connectWebSocket();
setInterval(updateTimeDisplays, 1000);