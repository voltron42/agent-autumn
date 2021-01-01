(ns agent-autumn.routes
  (:require [clojure.edn :as edn]
            [compojure.api.sweet :as sweet]
            [compojure.api.core :as api]
            [compojure.route :as route]
            [ring.util.http-response :as http]
            [ring.util.response :as resp]
            [schema.core :as s]
            [agent-autumn.schema :as schema]
            [agent-autumn.util :as util]
            [agent-autumn.game :as game]
            [agent-autumn.handlers :as h]))

(defn build-session-route [path method description body-params resp-schema handler]
  (api/context
    path []
    :tags ["game"]
    (sweet/resource
      (assoc
        {:description description}
        method
        {:summary    ""
         :parameters {:path-params {:session-id s/Str}
                      :body-params body-params}
         :responses  {200 {:schema resp-schema}}
         :handler    handler}))))

(defn ok-or-bad-request [resp]
  (if resp
    (http/ok resp)
    (http/bad-request)))

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
                                         (ok-or-bad-request (game/host-game (util/get-client-ip req) body-params)))}}))
        (api/context
          "/game/{session-id}" []
          :tags ["game"]
          (build-session-route "/join" :post "" {:playerName s/Str} schema/JoinResponse
                               (fn [{{:keys [session-id]} :path-params {:keys [playerName]} :body-params :as req}]
                                 (ok-or-bad-request (game/join-game session-id (util/get-client-ip req) playerName))))
          (build-session-route "/has-joined" :get "" {} schema/HasJoinedResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (ok-or-bad-request (game/has-joined-game? session-id (util/get-client-ip req)))))
          (build-session-route "/all-joined" :get "" {} schema/AllJoinedResponse
                               (fn [{{:keys [session-id]} :path-params}]
                                 (ok-or-bad-request (game/have-all-joined-game? session-id))))
          (build-session-route "/start-clock" :post "" {} schema/StartClockResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (ok-or-bad-request (game/start-game session-id (util/get-client-ip req)))))
          (build-session-route "/ready" :get "" {} schema/ReadyResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (ok-or-bad-request (game/get-ready-state session-id (util/get-client-ip req)))))
          (build-session-route "/vote" :post "" {:targetName s/Str} schema/VoteResponse
                               (fn [{{:keys [session-id]} :path-params {:keys [targetName]} :body-params :as req}]
                                 (ok-or-bad-request (game/vote-for-spy session-id (util/get-client-ip req) targetName))))
          (build-session-route "/guess" :post "" {:location s/Str} schema/GuessResponse
                               (fn [{{:keys [session-id]} :path-params {:keys [location]} :body-params :as req}]
                                 (ok-or-bad-request (game/guess-location session-id (util/get-client-ip req) location))))
          (build-session-route "/result" :get "" {} schema/ResultResponse
                               (fn [{{:keys [session-id]} :path-params}]
                                 (ok-or-bad-request (game/get-game-result session-id))))
          (build-session-route "/close" :delete "" {} schema/CloseResponse
                               (fn [{{:keys [session-id]} :path-params :as req}]
                                 (ok-or-bad-request (game/close-game session-id (util/get-client-ip req)))))))
      (sweet/routes
        (route/resources "/")
        (route/not-found "404 Not Found"))))
