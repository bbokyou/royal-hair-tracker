const API_KEY = "test_93e40beacb1a3d3f59a5e0c5e736b7328932f2cbd9f0fb7f771ff5f7a0a87be3efe8d04e6d233bd35cf2fabdeb93fb0d";

const BASE_URL =
  "https://open.api.nexon.com/mabinogi/v1/auction/keyword-search?keyword=" +
  encodeURIComponent("로얄 소사이어티 스타일 헤어 뷰티 쿠폰(여성용)(1회 거래 가능)");


async function loadAuction() {
    try {

 

const firstResponse = await fetch(BASE_URL, {
            method: "GET",
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });

        console.log("상태:", firstResponse.status);

        const firstData = await firstResponse.json();

        console.log(firstData);
console.log(firstData.auction_item.length);

        console.log(firstData);

        console.log("다음 커서:", firstData.next_cursor);

        /*
        const secondUrl =
    BASE_URL + "&cursor=" + firstData.next_cursor;


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

*/

const allItems = [...firstData.auction_item];

let nextCursor = firstData.next_cursor;
let page = 1;

while (nextCursor) {

    console.log("현재 페이지:", page);
    page++;

    console.log("다음 페이지 가져오는 중...");

    const url = BASE_URL + "&cursor=" + nextCursor;

const response = await fetch(url, {
        
            method: "GET",
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        }
    );

    const data = await response.json();

if (!data.auction_item || data.auction_item.length === 0) {
    console.log("더 이상 가져올 데이터가 없습니다.");
    break;
}
    allItems.push(...data.auction_item);

nextCursor = data.next_cursor;

await new Promise(resolve => setTimeout(resolve, 200));

console.log(
    "페이지:",
    nextCursor,
    "가져온 개수:",
    data.auction_item?.length
);

console.log("응답 상태:", response.status);

}

console.log("전체 아이템 개수:", allItems.length);

console.table(
    allItems
        .filter(item => item.item_display_name.includes("로얄"))
        .map(item => ({
            이름: item.item_display_name,
            가격: item.auction_price_per_unit
        }))
);

        const targetItems = allItems.filter(item =>
    item.item_display_name === "로얄 소사이어티 스타일 헤어 뷰티 쿠폰(여성용)(1회 거래 가능)"
);


const cheapItems = targetItems.filter(
    item => item.auction_price_per_unit === 110000000
);

console.log("1.1억 개수:", cheapItems.length);

console.table(
    cheapItems.map(item => ({
        가격: item.auction_price_per_unit,
        만료시간: item.date_auction_expire
    }))
);

console.log("여성용 개수:", targetItems.length);

console.table(
    targetItems
        .sort((a, b) => a.auction_price_per_unit - b.auction_price_per_unit)
        .map(item => ({
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