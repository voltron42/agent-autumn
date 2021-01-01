(ns agent-autumn.game
  (:require [clojure.data.codec.base64 :as b64]
            [clojure.core.async :as async]))

(defprotocol ^:private Session
  (join [this user-ip user-name])
  (has-joined? [this user-ip])
  (all-joined? [this])
  (is-host? [this user-ip])
  (start [this user-ip])
  (get-init-state [this user-ip])
  (vote [this user-ip vote-value])
  (guess [this user-ip guess-value])
  (get-result [this])
  (close [this]))

(defprotocol ^:private SessionCache
  (put-session [this session-id session])
  (get-session [this session-id])
  (close-session [this session-id]))

(defn- init-session-cache []
  (let [cache-map (atom {})
        cache-chan (async/chan 200)]
    (async/go-loop []
      (when-let [[session-id session] (async/<! cache-chan)]
        (if session
          (swap! cache-map assoc session-id session-id)
          (swap! cache-map dissoc session-id))
        (recur)))
    (reify SessionCache
      (put-session [_ session-id session]
        (async/>! cache-chan [session-id session]))
      (get-session [_ session-id]
        (get @cache-map session-id))
      (close-session [_ session-id]
        (async/>! cache-chan [session-id])))))

(defonce ^:private session-cache ^SessionCache (init-session-cache))

(defn- build-session-id [host-ip]
  (b64/encode (.getBytes (str (System/currentTimeMillis) "_" host-ip))))

(defmulti process-action
          (fn [_ action-and-args]
            (first action-and-args)))

(defmethod process-action :join
  [players [_ user-ip user-name roles is-host?]]
  (when (< (count players) (count roles))
    (assoc
      players
      user-ip
      {:name user-name
       :role (nth roles (count players))
       :is-host? is-host?})))

(defmethod process-action :vote
  [players [_ user-ip vote-value]]
  (update players user-ip assoc :vote vote-value))

(defmethod process-action :guess
  [players [_ user-ip location]]
  (update players user-ip assoc :guess location))

(defn update-result [result-atom players loc]
  (when-let [spy (first (filterv #(= "SPY" (:role %)) (vals players)))]
    (when-let [result (if-let [guess (:guess spy)]
                       (if (= guess loc)
                        {:spy-wins? true}
                        {:spy-wins? false})
                       (let [votes (mapv :vote (vals players))
                             total-vote-count (count (filterv #(not= "SPY" (:role %)) (vals players)))]
                        (when (= total-vote-count (dec (count players)))
                         (let [vote-counts (frequencies votes)
                               max-count (apply max (vals vote-counts))
                               winners (mapv first (filterv #(= max-count (second %)) vote-counts))]
                          (if (< 1 (count winners))
                           {:spy-wins? true}
                           (when (and (= 1 (count winners)) (not= (first winners) (:name spy)))
                            {:spy-wins? true}))))))]
      (reset! result-atom
              (assoc
                result
                :location loc
                :spy (:name spy))))))


(defn build-session ^Session [host-ip host-name player-count loc-list loc role-list duration]
  (let [roles ((shuffle (vec (cons "SPY" (take (dec player-count) (cycle (set role-list)))))))
        players (atom (process-action {} [:join host-ip host-name roles true]))
        player-chan (async/chan 200)
        is-all-joined? #(= player-count (count players))
        is-player-host? #(:is-host? (get @players %))
        end-time-atom (atom nil)
        result-atom (atom nil)]
    (async/go-loop []
      (when-let [action-&-args (async/<! player-chan)]
        (swap! players process-action action-&-args)
        (update-result result-atom @players loc)
        (recur)))
    (reify Session
      (join [_ user-ip user-name]
        (async/>! player-chan [:join user-ip user-name roles]))
      (is-host? [_ user-ip]
        (is-player-host? user-ip))
      (has-joined? [_ user-ip]
        (not (nil? (get @players user-ip))))
      (all-joined? [_]
        (is-all-joined?))
      (start [_ user-ip]
        (when (and (nil? @end-time-atom) (is-all-joined?) (is-player-host? user-ip))
          (reset! end-time-atom (+ duration (System/currentTimeMillis)))
          true))
      (get-init-state [_ user-ip]
        (let [end-time @end-time-atom
              role (get-in @players [user-ip :role])]
          (when (and end-time role)
            (assoc
              (if (= "SPY" role)
                {:role "SPY"}
                {:role role
                 :location loc})
              :endTime end-time
              :locations loc-list
              :players (mapv :name (vals @players))))))
      (vote [_ user-ip vote-value]
        (async/>! player-chan [:vote user-ip vote-value]))
      (guess [_ user-ip guess-value]
        (async/>! player-chan [:guess user-ip guess-value]))
      (get-result [_]
        @result-atom)
      (close [_]
        (async/close! player-chan)))))

(defn host-game [host-ip {:keys [hostName totalPlayerCount locList loc roleList duration]}]
  (let [session-id (build-session-id host-ip)]
    (put-session session-cache session-id (build-session host-ip hostName totalPlayerCount locList loc roleList duration))
    {:sessionID session-id}))

(defn join-game [session-id user-ip user-name]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      {:joining (true? (join session user-ip user-name))})))

(defn has-joined-game? [session-id user-ip]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      {:hasJoined (true? (has-joined? session user-ip))})))


(defn have-all-joined-game? [session-id]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      {:allJoined (true? (all-joined? session))})))

(defn start-game [session-id user-ip]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      {:startingClock (true? (start session user-ip))})))

(defn get-ready-state [session-id user-ip]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      (get-init-state session user-ip))))

(defn vote-for-spy [session-id user-ip target-name]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      {:voteSubmitted (vote session user-ip target-name)})))

(defn guess-location [session-id user-ip location]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      {:guessSubmitted (guess session user-ip location)})))

(defn get-game-result [session-id]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      (when-let [result (get-result session)]
        (let [{:keys [spy-wins?]} result]
          (assoc
            (dissoc result :spy-wins?)
            :result
            (cond
              (true? spy-wins?) "SPY WINS"
              (false? spy-wins?) "SPY LOSES"
              :else "NOT AVAILABLE")))))))

(defn close-game [session-id user-ip]
  (let [^Session session (get-session session-cache session-id)]
    (when session
      (when (is-host? session user-ip)
        (let [[a b] [(close session) (close-session session-cache session-id)]]
          {:closingSession (or a b)})))))
