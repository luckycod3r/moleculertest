const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

// создание брокера для первого узла
// определение nodeID и транспорта
const brokerNode1 = new ServiceBroker({
  nodeID: "node-1",
  transporter: "Redis"
});

// создать сервис "шлюз"
brokerNode1.createService({
  // имя сервиса
  name: "gateway",
  // загрузить HTTP сервер
  mixins: [HTTPServer],

  settings: {
    routes: [
      {
        aliases: {
          // при получении запроса "GET /products" будет выполнено действие "listProducts" из сервиса "products"
          "GET /products": "products.listProducts"
        }
      },
      {
        aliases: {
          // при получении запроса "GET /products" будет выполнено действие "listProducts" из сервиса "products"
          "GET /organs": "zhopa.piska"
        }
      }
    ]
  }
});

// создание брокера для второго узла
// определение nodeID и транспорта
const brokerNode2 = new ServiceBroker({
  nodeID: "node-2",
  transporter: "Redis"
});

// создание сервиса "products"
brokerNode2.createService({
  // имя сервиса
  name: "products",

  actions: {
    // определение действия, которое вернёт список доступных товаров
    listProducts(ctx) {
      return [
        { name: "Apples", price: 5 },
        { name: "Oranges", price: 3 },
        { name: "Bananas", price: 2 }
      ];
    }
  }
});


brokerNode2.createService({
    name : "zhopa",
    actions : {
        piska(ctx){
            return "pizda";
        }
    }
})
// запуск обоих брокеров
Promise.all([brokerNode1.start(), brokerNode2.start()]);