const API_KEY = "test_93e40beacb1a3d3f59a5e0c5e736b7328932f2cbd9f0fb7f771ff5f7a0a87be3efe8d04e6d233bd35cf2fabdeb93fb0d";

const BASE_URL =
  "https://open.api.nexon.com/mabinogi/v1/auction/list?auction_item_category=뷰티 쿠폰";


async function loadAuction() {
    try {
        const response = await fetch(BASE_URL, {
            method: "GET",
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });

        console.log("상태:", response.status);

        const data = await response.json();

        console.log(data);

        console.log("다음 커서:", data.next_cursor);

        console.table(
    data.auction_item
        .filter(item => item.item_display_name.includes("로얄"))
        .map(item => ({
            이름: item.item_display_name,
            가격: item.auction_price_per_unit
        }))
);

        console.log("받은 아이템 개수:", data.auction_item.length);

        const targetItems = data.auction_item.filter(item =>
    item.item_display_name === "로얄 소사이어티 스타일 헤어 뷰티 쿠폰(여성용)(1회 거래 가능)"
);

console.log(targetItems);

console.table(
    targetItems.map(item => ({
        이름: item.item_display_name,
        가격: item.auction_price_per_unit
    }))
);
    } catch (error) {
        console.error(error);
    }
}

loadAuction();