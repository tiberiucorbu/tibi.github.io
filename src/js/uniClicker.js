let points = 0;
let pointsPerSecond = 0;
// auto clickers
let priceAutoClicker = 20;
let amountAutoClickers = 0;
const autoclickerCostFactor = 1.1;
const autoClickerEfficiency = 1;
// auto clicker upgrade
let priceAutoClickerUpgrade = 200;
let amountUpgradedClickers = 0;
const autoClickerUpgradeCostFactor = 1.3;
const autoClickerUpgradeEfficiency = 5;

window.addEventListener('load',  (event) => {
    update();
});
//update function
function update() {
    pointsPerSecond = autoClickerEfficiency * amountAutoClickers + autoClickerUpgradeEfficiency * amountUpgradedClickers;
    document.getElementById('autoClickerButton').dataset.price = priceAutoClicker;
    document.getElementById('upgradeAutoClicker').dataset.price= priceAutoClickerUpgrade;
    updatePoints();
    updateCanPurchase();
    updatePointsPerSecond(pointsPerSecond);
    updateFields();
}

function generatePoints() {
    points += pointsPerSecond;
}
setInterval(update, 1000);
setInterval(generatePoints, 1000);

function updatePoints() {
    document.getElementById("points").innerHTML = points;
}

function updatePointsPerSecond(pointsPerSecond) {
    document.getElementById("pointsPerSecond").innerHTML = pointsPerSecond;
}

function updateFields() {
    //auto clickers
    if(amountAutoClickers > 0) {
        document.getElementById('autoclickerCost').innerHTML = priceAutoClicker;
        document.getElementById('amountAutoClicker').innerHTML = 'Nyan Cats: ' + amountAutoClickers;
    } else {
        document.getElementById('amountAutoClicker').innerHTML = '';
    }
    //upgraded clickers
    document.getElementById('upgradeAutoClicker').dataset.ownedCats = amountAutoClickers;
    if(amountUpgradedClickers) {
        document.getElementById('upgradeAutoClickerCost').innerHTML = priceAutoClickerUpgrade;
        document.getElementById('amountUpgradedClickers').innerHTML = 'Super Nyan Cats: ' + amountUpgradedClickers;
    } else {
        document.getElementById('amountUpgradedClickers').innerHTML = '';
    }
}

function updateCanPurchase() {
    document.querySelectorAll('button')
        .forEach((button) => {
            if (button.dataset.price) {
                button.disabled = button.dataset.price > points;
            }
            if(button.dataset.ownedCats) {
                button.disabled = parseInt(button.dataset.ownedCats) === 0 || button.dataset.price > points;
            }
        });
}

function addPoints() {
    points++;
    updatePoints();
}

function buyItem(amount) {
    if (points < amount) {
        return false;
    }

    points = points - amount;
    update();
    return true;
}

function buyAutoClicker() {
    if (buyItem(priceAutoClicker)) {
        priceAutoClicker = Math.ceil(Math.round(priceAutoClicker * autoclickerCostFactor) / 5) * 5;
        amountAutoClickers += 1;
        if (amountAutoClickers <= 20) {
            createAutoClicker();
        }
    }
}

function upgradeAutoClicker() {
    if(amountAutoClickers > 0) {
        if(buyItem(priceAutoClickerUpgrade)) {
            amountAutoClickers -=1;
            amountUpgradedClickers +=1;
            priceAutoClickerUpgrade = Math.ceil(Math.round(priceAutoClickerUpgrade * autoClickerUpgradeCostFactor) / 5) * 5;
            document.getElementById('upgradeAutoClickerCost').innerHTML = priceAutoClickerUpgrade;
            let upgradedClicker = document.getElementsByClassName('autoClicker')[0];
            if(upgradedClicker) {
                const minDuration = 3;
                const maxDuration = 6;
                const duration = Math.random() * (maxDuration - minDuration) + minDuration;
                upgradedClicker.classList.replace('autoClicker','autoClickerUpgrade');
                upgradedClicker.style.setProperty('--animation-duration', `${duration}s`);
            }
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