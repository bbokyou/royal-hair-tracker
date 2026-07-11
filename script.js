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
        
        const targetItems = firstData.auction_item;


console.log("전체 아이템 개수:", targetItems.length);

console.table(
    targetItems.map(item => ({
        이름: item.item_display_name,
        가격: item.auction_price_per_unit
    }))
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