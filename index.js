const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

// создание брокера для первого узла
// определение nodeID и транспорта
const brokerNode1 = new ServiceBroker({
  nodeID: "node-1",
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
          "GET /organs": "zhopa.piska"
        }
      }
    ]
  }
});

// создание брокера для второго узла
// определение nodeID и транспорта

// создание сервиса "products"


brokerNode1.createService({
    name : "zhopa",
    actions : {
        piska(ctx){
            return "pizda";
        }
    }
})
// запуск обоих брокеров
Promise.all([brokerNode1.start()]);