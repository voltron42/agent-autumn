(ns agent-autumn.server
  (:require [environ.core :refer [env]]
            [org.httpkit.server :as server]
            [agent-autumn.routes :as routes]))

(defn -main [& [port]]
  (let [my-app (routes/build-app)
        port (Integer/parseInt (str (or port (env :port) 5000)))]
    (println port)
    (server/run-server my-app
                       {:port     port
                        :join?    false
                        :max-line 131072})))
