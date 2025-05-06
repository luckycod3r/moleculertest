const { ServiceBroker } = require("moleculer");


require('dotenv').config();
// создание брокера для первого узла
// определение nodeID и транспорта
const brokerNode1 = new ServiceBroker({
  nodeID: "node-1",
});

// создать сервис "шлюз"
brokerNode1.createService();

/* Создание сервиса БД для постов, тут вызываются экшены из документации на find,create и т.п
так же можно коллить дефолтные mongoose методы
https://moleculer.services/docs/0.14/moleculer-db#Usage-2
*/
brokerNode1.createService();

brokerNode1.createService()
// запуск обоих брокеров
Promise.all([brokerNode1.start()]);