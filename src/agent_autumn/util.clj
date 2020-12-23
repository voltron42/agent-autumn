(ns agent-autumn.util
  (:require [clojure.string :as str]))

(defn get-client-ip [req]
  (if-let [ips (get-in req [:headers "x-forwarded-for"])]
    (-> ips (str/split #",") first)
    (:remote-addr req)))
