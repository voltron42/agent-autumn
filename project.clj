(defproject agent-autumn "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "EPL-2.0 OR GPL-2.0-or-later WITH Classpath-exception-2.0"
            :url "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.10.1"]
                 [org.flatland/ordered "1.5.7"]
                 [clj-commons/secretary "1.2.4"]
                 [http-kit "2.3.0"]
                 [environ "1.1.0"]
                 [metosin/compojure-api "1.1.11"]
                 [ring/ring-mock "0.4.0"]
                 [org.clojure/core.async "1.3.610"]
                 [org.clojure/data.codec "0.1.1"]]
  :repl-options {:init-ns agent-autumn.core}
  :resource-paths ["resources"])
