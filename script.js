const API_KEY = "test_93e40beacb1a3d3f59a5e0c5e736b7328932f2cbd9f0fb7f771ff5f7a0a87be3efe8d04e6d233bd35cf2fabdeb93fb0d";
const PRICE_LOG_KEY = "priceHistory";
const audio = new Audio("money.mp3");

const AUTO_REFRESH_TIME = 10 * 60 * 1000; // 10분

let soundEnabled = false;
document.getElementById("enable-sound").addEventListener("click", async () => {

    try {

      audio.currentTime = 0;
await audio.play();

audio.pause();
audio.currentTime = 0;
soundEnabled = true;
console.log("🔔최저가 알림 소리 켜기");

    } catch (e) {
        console.error(e);
    }

});

const BASE_URL =
  "https://open.api.nexon.com/mabinogi/v1/auction/keyword-search?keyword=" +
  encodeURIComponent("로얄 소사이어티 스타일 헤어 뷰티 쿠폰(여성용)(1회 거래 가능)");

  if ("Notification" in window) {
    Notification.requestPermission();
}

async function loadAuction() {

        document.getElementById("last-update").textContent =
        "🟡 조회 중임다...";
        
    try {

 

const firstResponse = await fetch(BASE_URL, {
            method: "GET",
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });


        const firstData = await firstResponse.json();

const targetItems = firstData.auction_item ?? [];

if (targetItems.length === 0) {
    document.getElementById("lowest-price").textContent = "아니 이럴수가?";
    document.getElementById("item-count").textContent = "0";
    document.getElementById("lowest-count").textContent = "매물이 없네...";

    document.getElementById("last-update").textContent =
        "🟢 마지막 조회 : " + new Date().toLocaleTimeString("ko-KR");

    return;
}

document.getElementById("item-count").textContent =
    targetItems.length;

const lowestItem = targetItems.reduce((lowest, item) => {
    return item.auction_price_per_unit < lowest.auction_price_per_unit
        ? item
        : lowest;
});

const lowestItemCount = targetItems.filter(item =>
    item.auction_price_per_unit === lowestItem.auction_price_per_unit
).length;

document.getElementById("lowest-count").textContent =
    lowestItemCount;

    const savedPrice = localStorage.getItem("lastLowestPrice");
const status = document.getElementById("price-status");

const currentPrice = Number(lowestItem.auction_price_per_unit);
const previousPrice = Number(savedPrice);

console.log("이전", previousPrice);
console.log("현재", currentPrice);

// 현재 가격 상태 표시
if (!savedPrice) {
    status.textContent = "👋 첫 기록입니다!";
}
else if (currentPrice < previousPrice) {

    const diff = previousPrice - currentPrice;

status.innerHTML = `
    🔥 끼얏호우 더 싸졌다!<br>
    ▼ ${formatGold(diff)}
`;
}
else if (currentPrice > previousPrice) {

    const diff = currentPrice - previousPrice;

status.innerHTML = `
    😭 악 가격 오름...<br>
    ▲ ${formatGold(diff)}
`;
}
else {
    status.textContent = "😐 흠 아직 그대로군.";
}

// 최저가가 바뀌면 최초 발견 시간 갱신
if (!savedPrice || currentPrice !== previousPrice) {

    localStorage.setItem(
        "firstSeenTime",
        new Date().toISOString()
    );

    console.log("최초 발견시간 갱신!");

}

// 가격이 내려갔을 때만 알림
if (
    savedPrice &&
    Number(lowestItem.auction_price_per_unit) < Number(savedPrice)
) {

    if (Notification.permission === "granted") {

        new Notification("👍최저가가 갱신되었다요!👍", {
           body:
    formatGold(Number(savedPrice)) +
    " → " +
    formatGold(lowestItem.auction_price_per_unit)
        });

    }

    if (soundEnabled) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
    }

}

document.getElementById("lowest-price").textContent =
    formatGold(lowestItem.auction_price_per_unit);

    updateBestPrice(lowestItem.auction_price_per_unit);

    savePriceHistory(lowestItem.auction_price_per_unit);

renderPriceHistory();

updateTodayRange();

localStorage.setItem(
    "lastLowestPrice",
    lowestItem.auction_price_per_unit
);

const firstSeenTime = localStorage.getItem("firstSeenTime");

document.getElementById("first-seen").textContent =
    new Date(firstSeenTime).toLocaleString("ko-KR");
    document.getElementById("last-update").textContent =
    "🟢 마지막 조회 : " + new Date().toLocaleTimeString("ko-KR");

    }


    catch (error) {

    console.error(error);

    document.getElementById("lowest-price").textContent =
        "불러오기 실패";

    document.getElementById("last-update").textContent =
        "🔴 이런! 조회 실패ㅠㅠ";
}
}
function updateBestPrice(currentPrice) {

    const savedBest =
        localStorage.getItem("bestPrice");

    if (
        !savedBest ||
        currentPrice < Number(savedBest)
    ) {

        localStorage.setItem(
            "bestPrice",
            currentPrice
        );

    }



    document.getElementById("best-price").textContent =
        formatGold(
            Number(localStorage.getItem("bestPrice"))
        );

}
function savePriceHistory(price) {
    const history =
        JSON.parse(localStorage.getItem(PRICE_LOG_KEY) ?? "[]");

    const last = history[history.length - 1];

    if (last && last.price === price) {
        return;
    }

    history.push({
        price: price,
        time: new Date().toISOString()
    });

    localStorage.setItem(
        PRICE_LOG_KEY,
        JSON.stringify(history)
    );
}

function renderPriceHistory() {

    const history =
        JSON.parse(localStorage.getItem(PRICE_LOG_KEY) ?? "[]");

    const container = document.getElementById("price-history");

    if (history.length === 0) {
        container.textContent = "아직 기록이 없습니다.";
        return;
    }

    container.innerHTML = "";

    [...history]
        .reverse()
        .slice(0, 20)
        .forEach((item, index, array) => {

            let icon = "🟰";

            if (index < array.length - 1) {

                if (item.price < array[index + 1].price)
                    icon = "🔻";

                else if (item.price > array[index + 1].price)
                    icon = "🔺";
            }

            const div = document.createElement("div");

            div.className = "history-item";

            div.innerHTML = `
                <div class="history-price">
                    ${icon} ${formatGold(item.price)}
                </div>

                <div class="history-time">
                    🕒 ${new Date(item.time).toLocaleString("ko-KR")}
                </div>
            `;

            container.appendChild(div);

        });

}

function updateTodayRange() {

    const history =
        JSON.parse(localStorage.getItem(PRICE_LOG_KEY) ?? "[]");

    const today = new Date().toDateString();

    const todayHistory = history.filter(item =>
        new Date(item.time).toDateString() === today
    );

    const container = document.getElementById("today-range");

    if (todayHistory.length === 0) {

        container.textContent = "오늘 기록이 없습니다.";

        return;

    }

    const prices = todayHistory.map(item => item.price);

    const maxPrice = Math.max(...prices);

    const minPrice = Math.min(...prices);

    const diff = maxPrice - minPrice;

    container.innerHTML = `
        <div class="today-title">📈 오늘의 시세</div>
        🔺 최고 ${formatGold(maxPrice)}<br>
        🔻 최저 ${formatGold(minPrice)}<br>
        📊 변동폭 ${formatGold(diff)}
    `;

     

}
function updateDuration() {
    const firstSeenTime = localStorage.getItem("firstSeenTime");

    if (!firstSeenTime) {
        document.getElementById("duration").textContent = "-";
        return;
    }

    const firstSeenDate = new Date(firstSeenTime);
    const now = new Date();

    const diffMs = now - firstSeenDate;

    const diffMinutes = Math.floor(diffMs / 1000 / 60);

    const days = Math.floor(diffMinutes / 1440);
    const hours = Math.floor((diffMinutes % 1440) / 60);
    const minutes = diffMinutes % 60;
        document.getElementById("duration").textContent =
        `${days}일 ${hours}시간 ${minutes}분`;


}

function formatGold(price) {

    const eok = Math.floor(price / 100000000);
    const man = Math.floor((price % 100000000) / 10000);

    if (eok > 0) {

        if (man > 0) {
            return `${eok}억 ${man}만 Gold`;
        }

        return `${eok}억 Gold`;
    }

    if (price >= 10000) {
        return `${Math.floor(price / 10000)}만 Gold`;
    }

    return `${price.toLocaleString()} Gold`;

}
loadAuction();

updateTodayRange();

updateDuration();
setInterval(updateDuration, 1000);

setInterval(loadAuction, AUTO_REFRESH_TIME);
