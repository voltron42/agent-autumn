(ns agent-autumn.schema
  (:require [schema.core :as s]))

(s/defschema NewGameSchema
  {:hostName s/Str
   :durationMS s/Int
   :totalPlayerCount s/Int
   :location s/Str
   :locList [s/Str]
   :roleList [s/Str]})

(s/defschema NewGameResponse
  {:sessionID s/Str})

(s/defschema JoinResponse
  {:joining s/Bool})

(s/defschema AllJoinedResponse
  {:allJoined s/Bool})

(s/defschema HasJoinedResponse
  {:hasJoined s/Bool})

(s/defschema StartClockResponse
  {:startingClock s/Bool})

(s/defschema ReadyResponse
  {:endTime s/Int
   :role s/Str
   (s/optional-key :location) s/Str
   :players [s/Str]
   :locations [s/Str]})

(s/defschema VoteResponse
  {:voteSubmitted s/Bool})

(s/defschema GuessResponse
  {:guessSubmitted s/Bool})

(s/defschema ResultResponse
  {:result (s/enum "SPY WINS" "SPY LOSES" "NOT AVAILABLE")
   (s/optional-key :spy) s/Str
   (s/optional-key :location) s/Str})

(s/defschema CloseResponse
  {:closingSession s/Bool})

