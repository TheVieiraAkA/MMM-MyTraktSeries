const NodeHelper = require("node_helper");
const Trakt = require("trakt.tv");
const moment = require("moment");
const fs = require("fs");
var importtoken;

module.exports = NodeHelper.create({
    start: function () {
        var events = [];
        this.fetchers = [];
        console.log("Starting node helper for: " + this.name);
    },
    createFetcher: function (client_id, client_secret, days, username, id_lista, type) {
        var self = this;
        let options = {
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: null,
            api_url: null,
        };
        const trakt = new Trakt(options);

        function importoldtoken() {
            return new Promise(function (fulfill, reject) {
                try {
                    importtoken = require('./token.json');
                    fulfill();
                } catch (ex) {
                    reject(ex);
                }
            });
        }

        importoldtoken().catch(function () {
            return trakt.get_codes().then(function (poll) {
                self.sendSocketNotification("OAuth", {
                    code: poll.user_code
                });
                return trakt.poll_access(poll);
            }).then(function () {
                importtoken = trakt.export_token();
                fs.writeFile("./modules/MMM-MyTraktSeries/token.json", JSON.stringify(importtoken), "utf8", function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                });
            });
        }).then(function () {
            trakt.import_token(importtoken).then(newTokens => {
                //console.log(importtoken);
                //console.log(trakt);

                /*  GET the list of shows from the custom list  */
                trakt.users.list.items.get({ 
                    username: username,
                    id: id_lista,
                    type: type
                }).then(SeriesList => {

                    var Episodes = [];
                    for (let tvShow = 0; tvShow < SeriesList.length; tvShow++) {

                        /*  GET INFO for every TV show from the list)  */

                        trakt.shows.progress.watched({
                            id: SeriesList[tvShow].show.ids.slug

                        }).then(info => {
                            var diff = (info.aired - info.completed); // progress from the episode 

                            if (diff != 0) {
                                Episodes.push({nome: SeriesList[tvShow].show.title, dif: diff, nextEp: info.next_episode.title});
                            } else {
                                Episodes.push({nome: SeriesList[tvShow].show.title, dif: diff, nextEp: ""});
                            }
                            self.sendSocketNotification("UNWATCHED", {
                                eps: Episodes
                            });

                        }).catch(err => console.log(err));
                    }
                });
            });
        });
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "PULL") {
            this.createFetcher(
                payload.client_id,
                payload.client_secret,
                payload.days,
                payload.username,
                payload.id_lista,
                payload.type
            );
        }
    }
});