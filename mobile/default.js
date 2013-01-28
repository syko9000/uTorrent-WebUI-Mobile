Storage.prototype.setObject = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObject = function(key) {
    var obj = this.getItem(key);
    if (!obj) return null;
    return JSON.parse(obj)
}

function reloadToken(func) {
    var doc = $.ajax({
        url: '/gui/token.html'
    }).done(function(data) {
        func($(data).text());
    });
}

function action(action, params, func) {
    if (!params) params = {};
    if (action)  params['action'] = action;
    reloadToken(function (token) {
        params['token'] = token;
        $.getJSON(
            '/gui/',
            params,
            function (data) {
                if (func) func(data);
            }
        );
    });
}

function add(uri) {
    action('add-url', { s: uri }, function (data) {
        loadTorrents();
    });
}

function remove(id) {
    action('remove', { hash: id }, function (data) {
        loadTorrents();
    });
}

function pause(id) {
    action('pause', { hash: id, list: 1 }, function (data) {
        loadTorrents();
    });
}

function start(id) {
    action('start', { hash: id, list: 1 }, function (data) {
        loadTorrents();
    });
}

function stop(id) {
    action('stop', { hash: id, list: 1 }, function (data) {
        loadTorrents();
    });
}

function setPriority(id, index, priority) {
    action('setprio', { hash: id, f: index, p: priority }, function (data) {
        //loadFiles();
    });
}

function buildTorrentItem(torrent) {
    var id = torrent[0];

    var tdiv = $('<li torrentid="' + id + '" data-mini="true"></li>');
    tdiv.addClass('torrent');

    link = $('<a class="a" href="#details" data-transition="slide"></a>').appendTo(tdiv);
    $('<span class="status-icon ui-li-icon" />').appendTo(link);
    $('<div class="title" style="font-size: 1.5em; white-space: nowrap; margin-left: 13px">' + title(torrent[2]) + '</div>').appendTo(link);

    var item = tdiv[0];
    item.progress = $("<div class=\"progress\"></div>").appendTo(link);
    item.share    = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.size     = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.eta      = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.dlspeed  = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.ulspeed  = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.peers    = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.seeders  = $("<span class=\"status\" />").appendTo(link).after(" ");

    item.percent = $('<span class="ui-li-count ui-btn-up-c ui-btn-corner-all" style="right: 2px">0%</span>').appendTo(link);

    item.progress.progressbar();

    item.setTorrentData = function(torrent) {
        var oldtorrent = $(this).data('torrent');
        if (oldtorrent) {
            if (oldtorrent[1] == 201 && oldtorrent[4] == 1000) {
                $(this).addClass("status202");
            } else {
                $(this).addClass("status" + oldtorrent[1]);
            }
        }

        $(this).data('torrent', torrent);

        if (torrent[1] == 201 && torrent[4] == 1000) {
            $(this).addClass("status202");
        } else {
            $(this).addClass("status" + torrent[1]);
        }

        this.progress.progressbar('option', 'value', torrent[4]/10);
        this.percent.text(torrent[4]/10 + '%');
        this.share.html('<em>Share</em>: ' + (torrent[7]/10) + "% of " + b2readable(torrent[3]));
        this.size.html('<em>Size</em>: ' + b2readable(torrent[5]) + " / " + b2readable(torrent[3]));
        this.eta.html('<em>ETA</em>: ' + eta(torrent[10]));
        this.dlspeed.html('<em>DL</em>: ' + b2readable(torrent[9]) + "/s");
        this.ulspeed.html('<em>UL</em>: ' + b2readable(torrent[8]) + "/s");
        this.peers.html('<em>P</em>: ' + torrent[12] + " (" + torrent[13] + ")");
        this.seeders.html('<em>S</em>: ' + torrent[14] + " (" + torrent[15] + ")");

        if (torrent[1] == 201 && torrent[4] == 1000) {
            this.size.hide();
            this.share.show();
        } else {
            this.size.show();
            this.share.hide();
        }
    }

    item.setTorrentData(torrent);

    return tdiv;
}

function buildFileItem(torrent, file) {
    var torrentid = torrent[0];
    var fileid = file[4];

    var tdiv = $('<li torrentid="' + torrentid + '" fileindex="' + fileid + '" data-mini="true" data-icon="false"></li>');
    tdiv.addClass('torrent file');

    link = $('<a class="a"></a>').appendTo(tdiv);
    $('<div class="title" style="font-size: 1.25em; white-space: nowrap; ">' + title(file[0]) + '</div>').appendTo(link);

    var item = tdiv[0];
    item.progress = $("<div class=\"progress\"></div>").appendTo(link);
    item.size     = $("<span class=\"status\" />").appendTo(link).after(" ");
    item.priority = $("<span class=\"status\" />").appendTo(link).after(" ");

    item.percent = $('<span class="ui-li-count ui-btn-up-c ui-btn-corner-all" style="right: 2px">0%</span>').appendTo(link);

    item.progress.progressbar({
        height: 6
    });

    item.setFileData = function(file) {
        if (torrent[1] == 201 && torrent[4] == 1000) {
            $(this).addClass("status202");
        } else {
            $(this).addClass("status" + torrent[1]);
        }

        var p = Math.round(file[2]/file[1]*1000)/10;

        this.priority.data('file', file);
        this.priority.data('priority', file[3]);
        this.priority.data('torrent', torrent);

        this.progress.progressbar('option', 'value', p);
        this.percent.text(p + '%');
        this.size.html('<em>Size</em>: ' + b2readable(file[2]) + " / " + b2readable(file[1]));
        this.priority.html('<em>Priority</em>: ' + priority2readable(file[3]));

        this.priority.click(function (event) {
            var torrent = $(this).data('torrent');
            var file = $(this).data('file');
            var priority = $(this).data('priority') + 1;

            if (priority >= 4) priority = 0;

            $(this).html('<em>Priority</em>: ' + priority2readable(priority));

            setPriority(torrent[0], file[4], priority);
        });
    }

    item.setFileData(file);

    return tdiv;
}

function b2readable(bytes) {
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var size = 0;
    while (true) {
        if (bytes > 1024) {
            bytes /= 1024;
            size++;
        } else {
            return (parseInt(bytes*100)/100) + " " + sizes[size];
        }
    }
}

function priority2readable(pr) {
    switch (pr) {
        case 0: return "skip";
        case 1: return "low";
        case 2: return "normal";
        case 3: return "high";
        default: return "high (" + pr + ")";
    }
}

function title(name) {
    return name.replace(/[\._]/g, " ");
}

function eta(seconds) {
    if (seconds > 0) {
        var s=parseInt(seconds % 60);
        seconds /= 60;
        var m=parseInt(seconds % 60);
        seconds /= 60;
        var h=parseInt(seconds % 24);
        seconds /= 24;
        var d=parseInt(seconds % 7);
        var w=parseInt(seconds / 7);
        seconds /= 365;
        var y=parseInt(seconds);

        if (y > 0) {
            var str = y+"y "+d+"d";
        } else {
            if (w > 0) {
                var str = w+"w "+d+"d";
            } else {
                if (d > 0) {
                    var str = d+"d "+h+"h";
                } else {
                    if (h > 0) {
                        var str = h+"h "+m+"m";
                    } else {
                        var str = m+"m "+s+'s';
                    }
                }
            }
        }
        return str;
    } else {
        return "∞";
    }
}

function loadFiles() {
    var torrent = sessionStorage.getObject('torrent');

    action('getfiles', { hash: torrent[0] }, function (data) {
        data.files.sort(function(a, b) {
            return 0;
        });

        for (i in data.files[1]) {
            var file = data.files[1][i];

            var items = $('#files [torrentid=' + torrent[0] + '][fileindex=' + file[4] + ']');
            if (!items.length) {
                items = buildFileItem(torrent, file);
            } else {
                items.each(function(index, item) {
                    item.setFileData(file);
                });
            }

            $('#files').append(items);

        }

        $('#files').listview('refresh');
    });
}

function loadTorrents() {
    action(null, { list: 1 }, function (data) {
        var tus = 0, tds = 0, tu = 0, td = 0, tf = 0;

        data.torrents.sort(function(a, b) {
            if (a[17] > b[17] && a[17] > 0) {
                return 1;
            } else if (a[17] < b[17] && b[17] > 0) {
                return -1;
            } else {
                return (a[1] > b[1]) ? 1 : -1;
            }
        });


        var list = {};
        for (i in data.torrents) {
            var torrent = data.torrents[i];
            list[torrent[0]] = true;
            if (torrent[1] == 201 && torrent[4] == 1000) {
                ++tu;
            } else {
                ++td;
            }
            if (torrent[1] == 136 && torrent[4] != 1000) {
                --td;
                torrent[1] = 137;
            }
            if (torrent[1] != 136) {
                tus += torrent[8];
                tds += torrent[9];
            } else {
                ++tf;
                --td;
            }

            var items = $('#torrents [torrentid=' + torrent[0] + ']');
            if (!items.length) {
                items = buildTorrentItem(torrent);

                items.on('click', function(event, ui) {
                    var torrent = $(this).data('torrent');

                    $('#files').children().not('.ui-li-divider').remove();

                    tdiv = buildTorrentItem(torrent);
                    tdiv.appendTo($('#files'));

                    sessionStorage.setObject('torrent', torrent);

                    loadFiles();
                });
            } else {
                items.each(function(index, item) {
                    item.setTorrentData(torrent);
                });
            }

            $('#torrents').append(items);

            items = $('#files [torrentid=' + torrent[0] + ']');
            if (items.length) {
                items[0].setTorrentData(torrent);
            }
        }

        $('#torrents').listview('refresh');

        $('#torrents').children().not('.ui-li-divider').each(function (i, tdiv) {
            var id = $(tdiv).attr('torrentid');
            var t = id.split('-');
            var id = t[0];
            if (tdiv.nodeType != 1 || !list[id]) {
                $(tdiv).remove();
            }
        });

        $('#total .ui-btn-text').html('<em>T:</em> ' + data.torrents.length);
        $('#downloading .ui-btn-text').html('<em>D:</em> ' + td);
        $('#uploading .ui-btn-text').html('<em>U:</em> ' + tu);
        $('#finished .ui-btn-text').html('<em>F:</em> ' + tf);
        $('#upspeed .ui-btn-text').html('<em>U:</em> ' + b2readable(tus) + '/s');
        $('#downspeed .ui-btn-text').html('<em>D:</em> ' + b2readable(tds) + '/s');
    });
}

$("#main").live('pageinit', function() {
    $( "#popupAdd" ).live('popupafteropen', function(event, ui) {
        $('#addUrl').focus();
    });
    $('#addButton').click(function() {
        add($('#addUrl').val());
        $('#popupAdd').popup( "close" );
        $('#addUrl').val('');
    });
    loadTorrents();
    window.loadTorrentsTimer = setInterval(loadTorrents, 1000);
});

$("#details").live( "pagebeforeshow", function( event, data ) {
    var torrent = sessionStorage.getObject('torrent');

    $('#files').children().not('.ui-li-divider').remove();

    tdiv = buildTorrentItem(torrent);
    tdiv.attr('data-icon', 'false');
    tdiv.attr('data-theme', 'e');
    $('a', tdiv).attr('href', null);
    tdiv.appendTo($('#files'));

    loadFiles();
    window.loadFilesTimer = setInterval(loadFiles, 1000);
});

$("#torrents li").live( "taphold", function (event) {
    event.preventDefault();

    var torrent = $(event.currentTarget).data('torrent');
    $("#menu").data('torrent', torrent);

    if (torrent[1] == 201 && torrent[4] == 1000) {
        $('#menu').addClass("status202");
    } else {
        $('#menu').addClass("status" + torrent[1]);
    }

    $("#menu").popup().popup("open", {
        transition: "slide",
        positionTo: "window"
    });
});

$( "#menu" ).on({
    popupbeforeposition: function() {
        var h = $( window ).height();

        $( "#menu" ).css( "height", h );
    }
});

$("#remove").live("click", function (event, ui) {
    var torrent = $('#menu').data('torrent');

    remove(torrent[0]);

    $('#menu').popup('close');
});

$("#pause").live("click", function (event, ui) {
    var torrent = $('#menu').data('torrent');

    pause(torrent[0]);

    $('#menu').popup('close');
});

$("#stop").live("click", function (event, ui) {
    var torrent = $('#menu').data('torrent');

    stop(torrent[0]);

    $('#menu').popup('close');
});

$("#start").live("click", function (event, ui) {
    var torrent = $('#menu').data('torrent');

    start(torrent[0]);

    $('#menu').popup('close');
});


