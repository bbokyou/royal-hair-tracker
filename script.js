const API_KEY = "test_93e40beacb1a3d3f59a5e0c5e736b7328932f2cbd9f0fb7f771ff5f7a0a87be3efe8d04e6d233bd35cf2fabdeb93fb0d";
const PRICE_LOG_KEY = "priceHistory";
const audio = new Audio("money.mp3");
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

// 현재 가격 상태 표시
if (!savedPrice) {
    status.textContent = "👋 첫 기록입니다!";
}
else if (currentPrice < previousPrice) {

    const diff = previousPrice - currentPrice;

    status.innerHTML = `
        🔥 끼얏호우 더 싸졌다!<br>
        ▼ ${diff.toLocaleString()} Gold
    `;
}
else if (currentPrice > previousPrice) {

    const diff = currentPrice - previousPrice;

    status.innerHTML = `
        😭 악 가격 오름...<br>
        ▲ ${diff.toLocaleString()} Gold
    `;
}
else {
    status.textContent = "😐 흠 아직 그대로군.";
}

// 가격이 내려갔을 때만 알림
if (
    savedPrice &&
    Number(lowestItem.auction_price_per_unit) < Number(savedPrice)
) {

    if (Notification.permission === "granted") {

        new Notification("👍최저가가 갱신되었다요!👍", {
            body:
                Number(savedPrice).toLocaleString() +
                " → " +
                lowestItem.auction_price_per_unit.toLocaleString() +
                " Gold"
        });

    }

    if (soundEnabled) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
    }

    localStorage.setItem(
        "firstSeenTime",
        new Date().toISOString()
    );
}

document.getElementById("lowest-price").textContent =
    lowestItem.auction_price_per_unit.toLocaleString() + " Gold";

    savePriceHistory(lowestItem.auction_price_per_unit);

    renderPriceHistory();

    localStorage.setItem(
    "lastLowestPrice",
    lowestItem.auction_price_per_unit
);

const firstSeenTime = localStorage.getItem("firstSeenTime");

document.getElementById("first-seen").textContent =
    new Date(firstSeenTime).toLocaleString("ko-KR");

    }


    catch (error) {
    console.error(error);

    document.getElementById("lowest-price").textContent =
        "불러오기 실패";
}
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

    if (item.price < array[index + 1].price) {
        icon = "🔻";
    }
    else if (item.price > array[index + 1].price) {
        icon = "🔺";
    }

}

        const div = document.createElement("div");

        div.innerHTML = `
            <strong>${icon} ${item.price.toLocaleString()} Gold</strong><br>
            ${new Date(item.time).toLocaleString("ko-KR")}
            <hr>
        `;

        container.appendChild(div);

    });

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
loadAuction();
updateDuration();
setInterval(updateDuration, 1000);