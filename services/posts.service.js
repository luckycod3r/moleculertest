const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const mongoose = require("mongoose");

module.exports = {
    name: "posts",
    version: 1,
    mixins: [DbService],
    adapter: new MongooseAdapter(process.env.MONGO_URL),
    model: mongoose.model("Post", mongoose.Schema({
        title: { type: String },
        content: { type: String },
        votes: { type: Number, default: 0}
    })),
    actions : {
      create : {
        rest : "POST /",
        handler(ctx){
            let {title,content,votes} = ctx.params;
            ctx.call("posts.create",{
              title : title,
              content : content,
              votes : votes
            });
            return title;
          }
      },
      getAll : {
        rest : "GET /",
        async handler(ctx){
            let posts = await ctx.call("posts.find");
            return posts;
        }
      },
      get : {
        rest : "GET /:id",
        async handler(ctx){
            let posts = await this.adapter.findOne({
              _id : ctx.params.id
            });
            return posts;
          }
      }
      
    
    }
  }