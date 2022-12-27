const BASE = "https://api.binance.com/api/v3";

//Get a list of all currencies using binance api
async function getCurrencyList() {
  const cryptoList = await fetch(BASE + "/ticker/price")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((e) => (e.price = +e.price));
      return data;
    })
    .catch((erreur) => {
      console.log(erreur);
    });
  for (let crypto of cryptoList.sort((a, b) => b.price - a.price)) {
    console.log(`Symbol : ${crypto.symbol} - Price : ${crypto.price}`);
  }
}

async function getDepth(direction = "asks", symbol = "BTCUSDT") {
  const params = new URLSearchParams({
    symbol,
  });
  console.log(BASE + "/depth?" + params);
  const depth = await fetch(BASE + "/depth?" + params)
    .then((res) => res.json())
    .catch((erreur) => {
      console.log(erreur);
    });
  return depth[direction];
}

async function refreshDataCandle(pair = "BTCUSDT", duration = "5m") {
  const params = new URLSearchParams({
    symbol: pair,
    interval: duration,
  });
  const data = await fetch(BASE + "/klines?" + params)
    .then((res) => res.json())
    .catch((erreur) => {
      console.log(erreur);
    });

  return data;
}

async function refreshData(pair = "BTCUSDT") {
  const params = new URLSearchParams({
    symbol: pair,
  });
  const data = await fetch(BASE + "/trades?" + params)
    .then((res) => res.json())
    .catch((erreur) => {
      console.log(erreur);
    });

  return data;
}

async function createOrder(
  api_key,
  secret_key,
  direction,
  price,
  amount,
  pair = "BTCUSD_d",
  order_type = "LimitOrder"
) {
  const params = new URLSearchParams({
    symbol: pair,
    side: direction,
    type: order_type,
    timeInForce: "GTC",
    quantity: amount,
    price: price,
  });
  const signature = crypto
    .createHmac("sha256", secret_key)
    .update(params.toString())
    .digest("hex");
  const headers = {
    "X-MBX-APIKEY": api_key,
  };
  const order = await fetch(BASE + "/order?" + params, {
    method: "POST",
    headers,
    signature,
  })
    .then((res) => res.json())
    .catch((erreur) => {
      console.log(erreur);
    });
  return order;
}

async function cancelOrder(api_key, secret_key, uuid) {
  const params = new URLSearchParams({
    symbol: pair,
    orderId: uuid,
  });
  const signature = crypto
    .createHmac("sha256", secret_key)
    .update(params.toString())
    .digest("hex");
  const headers = {
    "X-MBX-APIKEY": api_key,
  };
  const order = await fetch(BASE + "/order?" + params, {
    method: "DELETE",
    headers,
    signature,
  })
    .then((res) => res.json())
    .catch((erreur) => {
      console.log(erreur);
    });
  return order;
}
