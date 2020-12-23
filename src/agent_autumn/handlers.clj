(ns agent-autumn.handlers)

(defn new-game [host-ip {:keys [location locList roleList]}])

(defn join [user-ip session-id name]
  )

(defn all-joined? [user-ip session-id]
  )

(defn start-clock [user-ip session-id]
  )

(defn clock-started? [user-ip session-id]
  )

(defn list-players [user-ip session-id]
  )

(defn vote [user-ip session-id player-name]
  )

(defn list-locations [user-ip session-id]
  )

(defn guess [user-ip session-id player-name]
  )

(defn result [user-ip session-id]
  )

(defn close [user-ip session-id]
  )
