import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyDkZU4AOkAPmIQVx7L0vg1w3X3jRBFaMYg",
  authDomain: "bokkyou.firebaseapp.com",
  projectId: "bokkyou",
  storageBucket: "bokkyou.firebasestorage.app",
  messagingSenderId: "527930263050",
  appId: "1:527930263050:web:739bee6b5ab96dfc4201f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadPriceHistory() {

    const snapshot = await getDocs(
        collection(db, "priceHistory")
    );

    const history = [];

    snapshot.forEach(doc => {

        history.push(doc.data());

    });

    console.log(history);

    return history;

}

async function savePriceHistoryToFirestore(price) {

    try {

        await addDoc(
            collection(db, "priceHistory"),
            {
                price: price,
                time: new Date().toISOString()
            }
        );


        console.log("✅ Firestore 가격 저장 완료");

    } catch (e) {

        console.error("❌ Firestore 저장 실패", e);

    }

}


const API_KEY = "test_93e40beacb1a3d3f59a5e0c5e736b7328932f2cbd9f0fb7f771ff5f7a0a87be3efe8d04e6d233bd35cf2fabdeb93fb0d";
const PRICE_LOG_KEY = "priceHistory";
const audio = new Audio("assets/money.mp3");

const AUTO_REFRESH_TIME = 10 * 60 * 1000; // 10분

const refreshBtn = document.getElementById("refreshBtn");

let soundEnabled =
    localStorage.getItem("soundEnabled") === "true";

const soundBtn = document.getElementById("enable-sound");

soundBtn.textContent = soundEnabled
    ? "🔔 알림 ON"
    : "🔕 알림 OFF";

soundBtn.addEventListener("click", async () => {

    try {

        // 처음 한 번만 브라우저 오디오 권한 활성화
        if (!soundEnabled) {

            audio.currentTime = 0;
            await audio.play();
            audio.pause();
            audio.currentTime = 0;

        }

        soundEnabled = !soundEnabled;

        localStorage.setItem(
    "soundEnabled",
    soundEnabled
);

        soundBtn.textContent = soundEnabled
            ? "🔔 알림 ON"
            : "🔕 알림 OFF";

        console.log(
            soundEnabled
                ? "🔔 알림 켜짐"
                : "🔕 알림 꺼짐"
        );

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

        refreshBtn.disabled = true;
    refreshBtn.textContent = "⏳ 조회 중...";
        
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

        refreshBtn.disabled = false;
        refreshBtn.textContent = "🔄 지금 조회";

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

    audio.pause();
    audio.currentTime = 0;

    audio.play().catch(console.error);

}

}

document.getElementById("lowest-price").textContent =
    formatGold(lowestItem.auction_price_per_unit);

    savePriceHistory(lowestItem.auction_price_per_unit);

    updateBestPrice();

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
    refreshBtn.disabled = false;
refreshBtn.textContent = "🔄 지금 조회";


    }


    catch (error) {

    console.error(error);

    document.getElementById("lowest-price").textContent =
        "불러오기 실패";

    document.getElementById("last-update").textContent =
        "🔴 이런! 조회 실패ㅠㅠ";

        refreshBtn.disabled = false;
refreshBtn.textContent = "🔄 지금 조회";

}
}
function updateBestPrice() {

    const history =
    JSON.parse(localStorage.getItem(PRICE_LOG_KEY) ?? "[]");

    if (history.length === 0) {

    document.getElementById("best-price").textContent = "-";
    return;

}

const bestPrice = Math.min(
    ...history.map(item => item.price)
);

document.getElementById("best-price").textContent =
    formatGold(bestPrice);

    const currentPrice = history[history.length - 1].price;

const diff = currentPrice - bestPrice;

const diffText = document.getElementById("best-price-diff");

if (diff === 0) {

    diffText.textContent = "🎉 와 겁나 싸다!";
    diffText.style.color = "#2e7d32";


}
else {

    diffText.textContent =
    `▲ ${formatGold(diff)}`;

        diffText.style.color = "#d32f2f";

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

    savePriceHistoryToFirestore(price);

    // 최근 100개만 유지
if (history.length > 100) {
    history.shift();
}

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
        <div class="today-title">📈 오늘의 최저가 시세는?</div>
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

loadPriceHistory().then(history => {

    console.log("Firestore:", history);

});

loadAuction();

refreshBtn.addEventListener("click", loadAuction);

updateTodayRange();

updateDuration();
setInterval(updateDuration, 1000);

setInterval(loadAuction, AUTO_REFRESH_TIME);