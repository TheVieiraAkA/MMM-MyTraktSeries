/* global Module */

Module.register("MMM-MyTraktSeries", {
    defaults: {
        updateInterval: 20 * 60 * 1000, //every 20 minutes
        initialLoadDelay: 0,
        days: 1
    },
    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json',
            kr: 'translations/kr.json',
            pt: 'translations/pt.json'
        };
    },
    getStyles: function () {
        return ["MMM-Trakt.css"];
    },
    getScripts: function () {
        return ["moment.js"];
    },
    start: function () {
        Log.info("Starting module: " + this.name);
        moment.locale(config.language);
        this.traktData = {};
        this.traktCode;
        this.dados = [];
        this.try = 0;
        this.loaded = false;
        this.firstTime= true;
        this.scheduleUpdate(0);
    },
    getDom: function () {
        if (Object.keys(this.SeriesData).length === 0) {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = "Please enter the following on https://trakt.tv/activate: " + this.traktCode;
            wrapper.className = "small";
        } else {
            var wrapper = document.createElement("table");
            var heading = wrapper.insertRow(0);
            wrapper.className = "small tabelaTrakt";
            heading.insertCell(0).outerHTML = '<th class="ColLeft">' + this.translate('TITLE') + '</th>';
            heading.insertCell(1).outerHTML = '<th class="ColCenter">' + this.translate('TOSEE') + '</th>';
            heading.insertCell(2).outerHTML = '<th class="ColRight">' + this.translate('EPTITLE') + '</th>';
            this.dados.sort(function (a, b) {
                return a.nome.localeCompare(b.nome);
            });
            this.dados.sort(function (a, b) {
                return parseFloat(a.dif) - parseFloat(b.dif);
            });
            
            var aux = [];
            for (var i = 0; i < this.dados.length; i++) {
                if (this.dados[i].dif != 0) {
                    aux.push(this.dados[i]);
                }
            }
            for (var i = 0; i < 8; i++) {
                var tableHeader = wrapper.insertRow(-1);
                title = this.shorten(aux[i].nextEp, 19);
                tableHeader.insertCell(0).outerHTML = '<td class="ColLeft">' + this.shorten(aux[i].nome ,18) + '</td>';
                tableHeader.insertCell(1).outerHTML = '<td class="ColCenter">' + aux[i].dif + '</td>';
                tableHeader.insertCell(2).outerHTML = '<td class="ColRight">' + title + '</td>';
            }
        }
        return wrapper;
    },
    shorten: function (string, maxLength) {
        if (string.length > maxLength) {
            return string.slice(0, maxLength) + "&hellip;";
        }
        return string;
    },
    updateTrakt: function () {
        if (this.config.client_id === "") {
            Log.error("Trakt: client_id not set");
            return;
        }
        if (this.config.client_secret === "") {
            Log.error("Trakt: client_secret not set");
            return;
        }
        this.sendSocketNotification("PULL", {
            client_id: this.config.client_id,
            client_secret: this.config.client_secret,
            days: this.config.days,
            username: this.config.username,
            id_lista: this.config.id_lista,
            type: this.config.type
        });
        this.scheduleUpdate(0);
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "UNWATCHED") {
            this.SeriesData = payload.eps;
            this.updateDom();
        }
        if (notification === "OAuth") {
            this.traktCode = payload.code;
            this.updateDom();
        }
    },
    scheduleUpdate: function (delay) {
        var self = this;
        var nextLoad = 0;

        if(this.firstTime){
            setTimeout(function () { self.updateTrakt(); }, 5000);
            this.firstTime = false;
        }
        !this.firstTime && this.dados.length == 0 ? nextLoad = 5 * 1000 : nextLoad = 20 * 60 * 1000
        setTimeout(function () { self.updateTrakt(); }, nextLoad);

    }
});