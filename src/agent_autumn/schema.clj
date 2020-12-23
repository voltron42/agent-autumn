(ns agent-autumn.schema
  (:require [schema.core :as s]))

(s/defschema NewGameSchema
  {:playerCount s/Int
   :location s/Str
   :locList [s/Str]
   :roleList [s/Str]})

(s/defschema NewGameResponse
  {})

(s/defschema JoinResponse
  {})

(s/defschema AllJoinedResponse
  {})

(s/defschema StartClockResponse
  {})

(s/defschema ClockStartedResponse
  {})

(s/defschema ListPlayersResponse
  {})

(s/defschema VoteResponse {})

(s/defschema ListLocationsResponse {})

(s/defschema GuessResponse {})

(s/defschema ResultResponse {})

(s/defschema CloseResponse {})

