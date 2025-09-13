<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deriv Last Digits Display with Trade Simulation</title>
    <style>
        .market-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 10px;
        }

        .login-box {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .stepper-strategy {
            margin-top: 10px;
        }

        .stepper-strategy h3 {
            font-size: 1em;
        }

        .equation-box {
            width: 100%;
            height: auto;
        }

        .market {
            width: 100%;
            margin: 10px 0;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #333;
        }

        h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.2em;
        }

        .counts p {
            margin: 3px 0;
        }

        .last-digit {
            border: 1px solid black;
            text-align: center;
            width: 30px;
        }

        .quoteContainer {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 10px;
        }

        .triangles {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .quotes {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .triangle {
            width: 0;
            height: 0;
            margin-bottom: 2px;
        }

        .triangle-up {
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 5px solid green;
        }

        .triangle-down {
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid red;
        }

        .quoteBox {
            width: 60px;
            height: 30px;
            border: 1px solid black;
            text-align: center;
            line-height: 30px;
            font-size: 12px;
        }

        .equations-container {
            position: absolute;
            right: 20px;
            top: 20px;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .equation-box {
            width: 200px;
            height: 100px;
            background-image: url('https://i.pinimg.com/736x/fd/f4/38/fdf4383642bbefa31972a86cdea03f36.jpg');
            background-size: cover;
            background-position: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
        }

        .equation-label {
            color: red;
            font-family: 'Jokerman', cursive;
            font-size: 15px;
            width: 100%;
            display: flex;
            justify-content: space-between;
        }

        .simulation-box {
            margin-left: 10px;
            font-weight: bold;
            color: blue;
        }

        .analysis-box {
            width: 150px;
            height: 120px;
            background: #fff;
            border: 1px solid #ccc;
            padding: 10px;
            margin-top: 10px;
        }

        .analysis-box h3 {
            text-align: center;
            margin: 0 0 10px 0;
            font-size: 14px;
        }

        .analysis-box p {
            margin: 5px 0;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
        }

        .stepper-strategy h3 {
            color: #333;
            font-size: 1.1em;
            margin-bottom: 5px;
        }

        .container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
        }

        h1 {
            font-family: 'Jokerman', cursive, sans-serif;
            font-size: 15px;
            font-weight: bold;
            text-align: left;
        }

        .market {
            width: 32%;
            min-width: 400px;
            margin: 10px;
            vertical-align: top;
        }

        table {
            border-collapse: collapse;
            background-color: transparent;
            border: 1px solid black;
        }

        td {
            width: 20px;
            height: 20px;
            text-align: center;
            border: 1px solid black;
            color: blue;
        }

        .consecutive {
            color: red !important;
        }

        .counts p {
            font-family: 'Jokerman', cursive, sans-serif;
            color: black;
            line-height: 1.5;
            margin: 5px 0;
        }

        .count-box {
            border: 1px solid black;
            padding: 2px;
            background-color: white;
            width: 3em;
            display: inline-block;
            text-align: center;
        }

        .stepper-strategy h3 {
            text-align: center;
            margin-bottom: 10px;
            font-size: 1.2em;
            color: #333;
            font-family: 'Jokerman', cursive, sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .equation-box {
            width: 50%;
            line-height: 70%;
            min-width: 250px;
            margin: 1px;
            padding: 15px;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 2px;
            position: relative;
            overflow: hidden;
            background: rgba(255,255,255,0.9);
        }

        .equation-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('https://i.pinimg.com/736x/fd/f4/38/fdf4383642bbefa31972a86cdea03f36.jpg');
            background-size: cover;
            filter: blur(7px);
            z-index: -1;
        }

        .equation-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
        }

        .equation-title {
            font-family: 'Jokerman', cursive;
            color: red;
            font-size: 15px;
            margin: 0;
        }

        .equation-value {
            font-family: 'Jokerman', cursive;
            color: blue;
            font-size: 15px;
            font-weight: bold;
        }

        text[id^="countAbove"], 
        text[id^="countBelow"] {
            font-size: 10px;
            text-anchor: middle;
            dominant-baseline: central;
        }

        .spike-count-box {
            display: inline-block;
            min-width: 35px;
            text-align: center;
            margin-left: 5px;
            background: #ffeb3b;
            border: 1px solid #ffc107;
            border-radius: 3px;
            padding: 0 5px;
        }

        .quoteBox {
            display: inline-block;
            width: 50px;
            height: 30px;
            border: 1px solid black;
            margin: 5px;
            text-align: center;
            line-height: 30px;
        }

        svg {
            display: block;
            margin: 10px 0;
        }

        .trigger-item {
            margin-bottom: 5px;
        }

        .digit {
            margin-right: 10px;
        }

        .bot-display {
            width: 300px;
            padding: 20px;
            border: 1px solid black;
            background: #f5f5f5;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .bot-display h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.2em;
            text-align: center;
        }

        .bot-display p {
            margin: 5px 0;
            font-family: 'Jokerman', cursive;
            color: #333;
        }

        .real-account-box {
            background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
            border: 2px solid #0d8bf2;
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            color: white;
            font-weight: bold;
            text-align: center;
        }

        .alert-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    </style>
</head>
<body>
    <h1>The Collective Society</h1>
    
    <!-- Alert Sound Element -->
    <audio id="alertSound" preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" type="audio/mpeg">
    </audio>

    <!-- Real Account Container -->
    <div id="realAccountContainer" style="position: absolute; top: 20px; right: 20px; width: 30%; height: auto; border: 2px solid black; padding: 10px;">
        <div id="loginSection" class="login-box">
            <label for="apiToken">Enter Stepper Code:</label>
            <input type="text" id="apiToken" placeholder="Enter your Deriv API token" />
            <button id="loginButton">Login</button>
            <p id="loginStatus"></p>
            <!-- Vol 10 Stepper Strategy -->
            <div class="stepper-strategy">
                <h3>Vol 10 Stepper Strategy</h3>
                <div class="equation-box">
                    <p class="equation-label">equation odd <span id="maxConsecutiveOdd10">0</span></p>
                    <p class="equation-label">equation even <span id="maxConsecutiveEven10">0</span></p>
                    <span>accumulation =</span> <span id="accumulation10">$0.00</span>
                </div>
            </div>
            <!-- Vol 25 Stepper Strategy -->
            <div class="stepper-strategy">
                <h3>Vol 25 Stepper Strategy</h3>
                <div class="equation-box">
                    <p class="equation-label">equation odd <span id="maxConsecutiveOdd25">0</span></p>
                    <p class="equation-label">equation even <span id="maxConsecutiveEven25">0</span></p>
                    <span>accumulation =</span> <span id="accumulation25">$0.00</span>
                </div>
            </div>
            <!-- New Run Panel Box Below Even/Odd Count Boxes -->
            <div class="run-panel-box" style="width: 100%; height: auto; margin-top: 20px; border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
                <div class="run-panel__container--mobile">
                    <div data-testid="drawer" class="dc-drawer run-panel dc-drawer--open" style="z-index: 6;">
                        <div class="dc-drawer__toggle dc-drawer__toggle--open">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" class="dc-drawer__toggle-icon">
                                <g><path fill-rule="evenodd" d="M31.775 21.291a1.5 1.5 0 0 1-2.066.483L16 13.266l-13.709 8.51a1.5 1.5 0 0 1-1.582-2.55l14.5-9a1.5 1.5 0 0 1 1.582 0l14.5 9a1.5 1.5 0 0 1 .483 2.066" clip-rule="evenodd"></path></g>
                                <defs><clipPath id="66a5701583d5ae63070dcf35c8859523__a"><path d="M0 0h32v32H0z"></path></clipPath></defs>
                            </svg>
                        </div>
                        <div class="dc-drawer__container">
                            <div class="dc-drawer__header">
                                <button id="db-run-panel__clear-button" class="dc-btn dc-btn--secondary run-panel__clear-button" disabled="" tabindex="0" type="submit">
                                    <span class="dc-text dc-btn__text" style="--text-size: var(--text-size-xs); --text-color: var(--text-general); --text-lh: var(--text-lh-m); --text-weight: var(--text-weight-bold); --text-align: var(--text-align-center);">Reset</span>
                                </button>
                            </div>
                            <div class="dc-drawer__content run-panel__content">
                                <div class="dc-tabs dc-tabs--top" style="--tab-width: 33.33%;">
                                    <div class="">
                                        <ul class="dc-tabs__list dc-tabs__list--top dc-tabs__list--border-bottom">
                                            <li id="db-run-panel-tab__summary" class="dc-tabs__item dc-tabs__active dc-tabs__item--top">Summary</li>
                                            <li id="db-run-panel-tab__transactions" class="dc-tabs__item dc-tabs__item--top">Transactions</li>
                                            <li id="db-run-panel-tab__journal" class="dc-tabs__item dc-tabs__item--top">Journal</li>
                                            <span class="dc-tabs__active-line dc-tabs__active-line--top" style="left: 0.0416666px; width: 306.635px;"></span>
                                        </ul>
                                    </div>
                                    <div class="dc-tabs__content">
                                        <div class="run-panel-tab__content--mobile" data-testid="mock-summary">
                                            <div data-testid="dt_themed_scrollbars" class="dc-themed-scrollbars summary dc-themed-scrollbars__autohide" style="max-height: 100%; max-width: none;">
                                                <div class="db-summary-card db-summary-card--mobile db-summary-card--inactive" data-testid="dt_mock_summary_card">
                                                    <p class="dc-text" style="--text-size: var(--text-size-xs); --text-color: var(--text-general); --text-lh: var(--text-lh-s); --text-weight: var(--text-weight-normal); --text-align: var(--text-align-center);">When you’re ready to trade, hit <strong class="summary-panel-inactive__strong">Run</strong>. You’ll be able to track your bot’s performance here.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="run-panel__stat run-panel__stat--mobile">
                                    <div class="run-panel__stat--info">
                                        <div class="run-panel__stat--info-item">What's this?</div>
                                    </div>
                                    <div class="run-panel__stat--tiles">
                                        <div class="run-panel__tile">
                                            <div class="run-panel__tile-title">Total stake</div>
                                            <div class="run-panel__tile-content"><span></span><span id="totalStake">0.00 USD</span></div>
                                        </div>
                                        <div class="run-panel__tile">
                                            <div class="run-panel__tile-title">Total payout</div>
                                            <div class="run-panel__tile-content"><span></span><span id="totalPayout">0.00 USD</span></div>
                                        </div>
                                        <div class="run-panel__tile">
                                            <div class="run-panel__tile-title">No. of runs</div>
                                            <div class="run-panel__tile-content" id="numRuns">0</div>
                                        </div>
                                        <div class="run-panel__tile">
                                            <div class="run-panel__tile-title">Contracts lost</div>
                                            <div class="run-panel__tile-content" id="contractsLost">0</div>
                                        </div>
                                        <div class="run-panel__tile">
                                            <div class="run-panel__tile-title">Contracts won</div>
                                            <div class="run-panel__tile-content" id="contractsWon">0</div>
                                        </div>
                                        <div class="run-panel__tile">
                                            <div class="run-panel__tile-title">Total profit/loss</div>
                                            <div class="run-panel__tile-content run-panel__stat-amount"><span></span><span id="totalProfitLoss">0.00 USD</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="controls__section">
                        <div class="controls__buttons">
                            <div class="animation__wrapper controls__animation">
                                <button id="db-animation__run-button" class="dc-btn dc-btn__effect dc-btn--primary animation__run-button" tabindex="0" type="submit">
                                    <div class="dc-btn__icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="30" viewBox="0 0 15 30" role="img" fill="#fff">
                                            <g><path d="m2.852 7.023 11.25 6.875c.546.352.898.977.898 1.602 0 .664-.352 1.29-.898 1.602l-11.25 6.875c-.586.351-1.329.39-1.914.039C.352 23.703 0 23.078 0 22.375V8.625c0-.664.352-1.29.938-1.602a1.87 1.87 0 0 1 1.914 0"></path></g>
                                            <defs><clipPath id="5ee83372ccfd798812bd05e435d763a1__a"><path d="M0 0h15v30H0z"></path></clipPath></defs>
                                        </svg>
                                    </div>
                                    <span class="dc-text dc-btn__text" style="--text-size: var(--text-size-xs); --text-color: var(--text-general); --text-lh: var(--text-lh-m); --text-weight: var(--text-weight-bold); --text-align: var(--text-align-center);">Run</span>
                                </button>
                                <div class="animation__container controls__animation">
                                    <span class="animation__text">Bot is not running</span>
                                    <div class="animation__progress">
                                        <div class="animation__progress-line">
                                            <div class="animation__progress-bar animation__progress-0"></div>
                                        </div>
                                        <div class="circular-wrapper"><span class="static-circle"></span><span class="dynamic-circle"></span></div>
        
