const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const mongoose = require("mongoose");
require('dotenv').config();
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
        path : '/api'
      },
      {
        aliases: {
          "GET /organs": "zhopa.piska"
        }
      },
      {
        aliases: {
          "POST /posts": "posts.createPost"
        }
      },
      {
        aliases: {
          "GET /posts": "posts.getPosts"
        }
      },
      {
        aliases: {
          "GET /posts/:id": "posts.getPostsCustomMongoMethod"
        }
      }
    ]
  }
});

/* Создание сервиса БД для постов, тут вызываются экшены из документации на find,create и т.п
так же можно коллить дефолтные mongoose методы
https://moleculer.services/docs/0.14/moleculer-db#Usage-2
*/
brokerNode1.createService({
  name: "posts",
  mixins: [DbService],
  adapter: new MongooseAdapter(process.env.MONGO_URL),
  model: mongoose.model("Post", mongoose.Schema({
      title: { type: String },
      content: { type: String },
      votes: { type: Number, default: 0}
  })),
  actions : {
    createPost(ctx){
      let {title,content,votes} = ctx.params;
      brokerNode1.call("posts.create",{
        title : title,
        content : content,
        votes : votes
      });
      return title;
    },
    async getPosts(ctx){
      let posts = await brokerNode1.call("posts.find");
      return posts;
    },
    async getPostsCustomMongoMethod(ctx){
      let posts = await this.adapter.findOne({
        _id : ctx.params.id
      });
      return posts;
    }
  }
});

brokerNode1.createService({
    name : "zhopa",
    actions : {
        piska(ctx){
            return "pizda";
        },   
    }
})
// запуск обоих брокеров
Promise.all([brokerNode1.start()]);