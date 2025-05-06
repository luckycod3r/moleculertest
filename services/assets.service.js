const path = require("path");
const fs = require("fs");

module.exports = {
    name: "assets",
    version: 1,
    actions: {
      upload: {
        handler(ctx) {
          return new Promise((resolve, reject) => {
            const filePath = path.join("assets", ctx.meta.filename );
             const f = fs.createWriteStream(filePath);
             f.on("close", () => {
              
                 resolve({
                     uploaded: true,
                 });
             });

             ctx.params.on("error", (err) => {
                 console.log(" error ", err.message);
                 reject(err);
                 f.destroy(err);
             });

             ctx.params.pipe(f);
         }); 
        }
      }
    }
  };
  