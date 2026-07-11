const API_KEY = "test_93e40beacb1a3d3f59a5e0c5e736b7328932f2cbd9f0fb7f771ff5f7a0a87be3efe8d04e6d233bd35cf2fabdeb93fb0d";

const BASE_URL =
  "https://open.api.nexon.com/mabinogi/v1/auction/list?auction_item_category=뷰티 쿠폰";


async function loadAuction() {
    try {

        let cursor = "";
        let allItems = [];
        let page = 1;

        while (true) {
            console.log("현재 페이지:", page);
break;

        }

        let url = BASE_URL;

if (cursor !== "") {
    url = BASE_URL + "&cursor=" + cursor;
}

const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });

        console.log("상태:", response.status);

        const data = await response.json();

        console.log(data);

        console.log("다음 커서:", data.next_cursor);

        const secondUrl =
    BASE_URL + "&cursor=" + data.next_cursor;

console.log(secondUrl);

const response2 = await fetch(secondUrl, {
    method: "GET",
    headers: {
        "x-nxopen-api-key": API_KEY
    }
});

const data2 = await response2.json();

console.log("2페이지 개수:", data2.auction_item.length);
console.log("2페이지 다음 커서:", data2.next_cursor);

const allItems = [
    ...data.auction_item,
    ...data2.auction_item
];

console.log("전체 아이템 개수:", allItems.length);

console.table(
    allItems
        .filter(item => item.item_display_name.includes("로얄"))
        .map(item => ({
            이름: item.item_display_name,
            가격: item.auction_price_per_unit
        }))
);
        console.log("받은 아이템 개수:", data.auction_item.length);

        const targetItems = allItems.filter(item =>
    item.item_display_name === "로얄 소사이어티 스타일 헤어 뷰티 쿠폰(여성용)(1회 거래 가능)"
);

console.log(targetItems);

console.table(
    targetItems.map(item => ({
        이름: item.item_display_name,
        가격: item.auction_price_per_unit
    }))
);
if (targetItems.length > 0) {

    const lowestPrice = Math.min(
        ...targetItems.map(item => item.auction_price_per_unit)
    );

    document.getElementById("lowest-price").textContent =
        lowestPrice.toLocaleString() + " Gold";

}
    } catch (error) {
        console.error(error);
    }
}

loadAuction();