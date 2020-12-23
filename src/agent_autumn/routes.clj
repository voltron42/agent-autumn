(ns agent-autumn.routes
  (:require [compojure.api.sweet :as sweet]
            [compojure.api.core :as api]
            [compojure.route :as route]
            [ring.util.http-response :as http]
            [ring.util.response :as resp]
            [schema.core :as s]
            [agent-autumn.schema :as schema]
            [agent-autumn.handlers :as h]
            [agent-autumn.util :as util]
            [clojure.edn :as edn]))

(defn build-session-route [path method description query-params resp-schema handler]
  (api/context
    path []
    :tags ["game"]
    (sweet/resource
      (assoc
        {:description description}
        method
        {:summary    ""
         :parameters {:path-params {:session-id s/Str}
                      :query-params query-params}
         :responses  {200 {:schema resp-schema}}
         :handler    handler}))))

(defn build-app []
  (-> {:swagger
       {:ui   "/swagger/ui"
        :spec "/swagger.json"
        :data {:info {:title       "Spy Hard With A Vengeance"
                      :description "Deception parlor game"}
               :tags [{:name "game" :description "game api"}]}}}
      (sweet/api
        (api/context
          "/host" []
          :tags ["game"]
          (sweet/resource
            {:description "Initialize a game session"
             :post        {:summary    ""
                           :parameters {:body-params schema/NewGameSchema}
                           :responses  {200 {:schema schema/NewGameResponse}}
                           :handler    (fn [{:keys [body-params] :as req}]
                                         (http/ok (h/new-game (util/get-client-ip req) body-params)))}}))
        (api/context
          "/game/{session-id}" []
          :tags ["game"]
          (build-session-route "/join" :post "" {:playerName s/Str} schema/JoinResponse
                               (fn [{{:keys [session-id]} :path-params {:keys [playerName]} :query-params :as req}]
                                 (http/ok (h/join (util/get-client-ip req) session-id playerName))))
          (build-session-route "/all-joined" :get "" {} schema/AllJoinedResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/all-joined? (util/get-client-ip req) session-id ))))
          (build-session-route "/start-clock" :post "" {} schema/StartClockResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/start-clock (util/get-client-ip req) session-id ))))
          (build-session-route "/clock-started" :get "" {} schema/ClockStartedResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/clock-started? (util/get-client-ip req) session-id ))))
          (build-session-route "/list-players" :get "" {} schema/ListPlayersResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/list-players (util/get-client-ip req) session-id ))))
          (build-session-route "/vote" :post "" {:playerName s/Str} schema/VoteResponse
                               (fn [{{:keys [session-id]} :path-params {:keys [playerName]} :query-params :as req}]
                                 (http/ok (h/vote (util/get-client-ip req) session-id playerName))))
          (build-session-route "/list-locations" :get "" {} schema/ListLocationsResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/list-locations (util/get-client-ip req) session-id ))))
          (build-session-route "/guess" :post "" {:playerName s/Str} schema/GuessResponse
                               (fn [{{:keys [session-id]} :path-params {:keys [playerName]} :query-params :as req}]
                                 (http/ok (h/guess (util/get-client-ip req) session-id playerName))))
          (build-session-route "/result" :get "" {:playerName s/Str} schema/ResultResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/result (util/get-client-ip req) session-id))))
          (build-session-route "/close" :delete "" {:playerName s/Str} schema/CloseResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (http/ok (h/close (util/get-client-ip req) session-id))))))
      (sweet/routes
        (route/resources "/")
        (route/not-found "404 Not Found"))))
