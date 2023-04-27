let points = 100;
// auto clickers
let priceAutoClicker = 100;
let amountAutoClickers = 0;
const autoclickerCostFactor = 1.1;

//update function
function update() {
    points += amountAutoClickers;
    document.getElementById('autoClickerButton').dataset.price = priceAutoClicker;
    updatePoints();
    updateCanPurchase();
    updatePointsPerSecond();
}

setInterval(update, 1000);

function updatePoints() {
    document.getElementById("points").innerHTML = points;
}

function updatePointsPerSecond() {
    const pointsPerSecond = amountAutoClickers;
    document.getElementById("pointsPerSecond").innerHTML = pointsPerSecond;
}

function updateCanPurchase() {
    document.querySelectorAll('button')
        .forEach((button) => {
            if (button.dataset.price) {
                button.disabled = button.dataset.price > points;
            }
        });
}

function addPoints() {
    points++;
    updatePoints();
}

function buyUpgrade(amount) {
    if (points < amount) {
        return false;
    }

    points = points - amount;
    return true;
}

function buyAutoClicker() {
    if (buyUpgrade(priceAutoClicker)) {
        priceAutoClicker = Math.ceil(Math.round(priceAutoClicker * autoclickerCostFactor) / 5) * 5;
        amountAutoClickers += 1;
        document.getElementById('autoclickerCost').innerHTML = priceAutoClicker;
        document.getElementById('amountAutoClicker').innerHTML = 'Nyan Cats: ' + amountAutoClickers;
        if (amountAutoClickers <= 20) {
            createAutoClicker();
        }
    }
}

function createAutoClicker() {
    const minDuration = 5;
    const maxDuration = 10;
    const duration = Math.random() * (maxDuration - minDuration) + minDuration;
    const clicker = document.createElement('div');
    const clickerContainer = document.createElement('div');
    clicker.classList.add('autoClicker');
    clickerContainer.classList.add('autoClicker-container');
    clickerContainer.appendChild(clicker);
    clicker.style.setProperty('--animation-duration', `${duration}s`);
    document.body.appendChild(clickerContainer);
}