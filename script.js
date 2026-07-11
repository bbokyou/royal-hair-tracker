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


        const firstData = await firstResponse.json();

const targetItems = firstData.auction_item ?? [];

if (targetItems.length === 0) {
    document.getElementById("lowest-price").textContent = "매물 없음";
    return;
}

document.getElementById("item-count").textContent =
    targetItems.length;

const lowestItem = targetItems.reduce((lowest, item) => {
    return item.auction_price_per_unit < lowest.auction_price_per_unit
        ? item
        : lowest;
});

document.getElementById("lowest-price").textContent =
    lowestItem.auction_price_per_unit.toLocaleString() + " Gold";

    localStorage.setItem(
    "lastLowestPrice",
    lowestItem.auction_price_per_unit
);

console.log(
    localStorage.getItem("lastLowestPrice")
);
    }


    catch (error) {
    console.error(error);

    document.getElementById("lowest-price").textContent =
        "불러오기 실패";
}
}

loadAuction();