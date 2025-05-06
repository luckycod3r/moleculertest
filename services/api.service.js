const HTTPServer = require("moleculer-web");

module.exports = {
  // имя сервиса
  name: "gateway",
  // загрузить HTTP сервер
  mixins: [HTTPServer],
  

  settings: {
    port: process.env.PORT || 3000,

		// Exposed IP
		ip: "0.0.0.0",
    routes: [
      {
        path: "/api",

        whitelist: [
            "v1.posts.*",
            "zhopa.*"
        ],
        
        autoAliases: true
      }
    ]
  }
}