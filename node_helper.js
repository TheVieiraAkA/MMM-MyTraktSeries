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
    createFetcher: function (client_id, client_secret, username, id_lista, type) {
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
            }).catch(error => {
                console.log(error.message);
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

                            var diff = (info.aired - info.completed); // progress if the TV Show

                            if(diff > 0){ 
                                var name = ""

                                /*  If there is no name assign, the name will be "Episode number XX" being the XX the number of the episode  */

                                SeriesList[tvShow].show.title ? name = info.next_episode.title : name = "Episódio Número " + info.next_episode.number
                                
                                Episodes.push({
                                    nome : SeriesList[tvShow].show.title, 
                                    dif: diff, 
                                    nextEp: name
                                });
                                
                            }
                            self.sendSocketNotification("UNWATCHED", {
                                eps: Episodes
                            });
                        }).catch(error => console.log("trakt. error get episodes from series \n\n " + error)) }
                }).catch(error => console.log("trakt. error get series list \n\n " + error))
            }).catch(error => console.log("trakt. error import token \n\n" + error))
        });
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "PULL") {
            this.createFetcher(
                payload.client_id,
                payload.client_secret,
                payload.username,
                payload.id_lista,
                payload.type
                );
        }
    }
});
