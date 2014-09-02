var app = {

    init: function () {
        var self = this;
        this.getActiveMilestones(function (data) {
            $(window).ready(function () {

                var attr = window.location.pathname.split('/');
                if (attr[1] === 'c') {
                    $(document).ready(function () {
                        setTimeout(self.appendButton(data), 1000);
                    });
                }

                $(window.location).on('changeLocation', function () {
                    var attr = window.location.pathname.split('/');
                    if (attr[1] === 'c') {
                        $(document).ready(function () {
                            self.appendButton(data);
                        });
                    }
                });

            });
        });
    },

    appendButton: function (milestones) {
        var self = this;
        self.removeButton();
        var attr = window.location.pathname.split('/');
        var shortId = attr[2];
        var iteration = '';
        var milestoneOptions = new Array();
        for (var i = 0; i < milestones.length; i++) {
            milestoneOptions.push('<option value="' + milestones[i] + '">' + milestones[i] + '</option>');
        }
        if (config.agileTrac) {
            iteration = '<label for="iteration-trac">Iteration</label>\
                        <input style="width: 130px" name="iteration-trac" />';
        }
        $('.window-sidebar').append('\
            <div class="window-module" data-trac-role="content">\
                <a class="button-link" data-trac-role="open" href="#">SendToTrac</a>\
                <div data-trac-role="form-card" style="display:none">\
                    <a class="quiet-button" style="float: right" data-trac-role="close">X</a>\
                    <form>\
                        <label for="milestone-trac">Milestone</label>\
                        <select style="width: 130px" name="milestone-trac">\
                        ' + milestoneOptions + '\
                        </select>\
                        ' + iteration + '\
                        <a class="quiet-button" style="float: right" data-trac-role="send" data-trac-cardid="' + shortId + '">send</a>\
                        <br/>\
                    </form>\
                </div>\
            </div>\
        ');
        self.attachEvent();
    },

    removeButton: function () {
        $('[data-trac-role="content"]').remove();
    },

    attachEvent: function () {
        $('[data-trac-role="open"]').on('click', function (event) {
            event.preventDefault();
            $(this).next().slideDown();
        });

        $('[data-trac-role="close"]').on('click', function (event) {
            event.preventDefault();
            $(this).parent().slideUp();
        });

        $('[data-trac-role="send"]').on('click', function (event) {
            event.preventDefault();
            var info;
            var $el = $(this);
            $el.hide();
            var formValue = self.getFormValue(this);
            var shortId = $(this).data('trac-cardid');
            self.getCardInfo(shortId, function (data) {
                if (config.agileTrac) {
                    self.sendCardAgile(data.id, data.idBoard, formValue, $el);
                } else {
                    info = self.convertResponse(data);
                    self.sendCardXmlRpc(info, formValue, $el);
                }
            });
        });
    },

    getMilestones: function (callback) {
        $.xmlrpc({
            url: config.protocol + '://' + config.user + ':' + config.password +'@' + config.baseUrl + 'login/xmlrpc',
            methodName: 'ticket.milestone.getAll',
            success: function(response, status, jqXHR) {
                var status = callback(response[0]);
            },
            error: function(jqXHR, status, error) {
                alert('Error on retrieve milestone');
            }
        });
        return status;
    },

    getActiveMilestones: function (callback) {
        $.ajax({
            dataType: 'json',
            type: 'GET',
            url: config.protocol + '://' + config.baseUrl + 'trello/activemilestones',
            data: {},
            success: function (response) {
                var status = callback(response);
            }
        });
        return status;
    },

    sendCardXmlRpc: function (info, formValue, $el) {
        $.xmlrpc({
            url: config.protocol + '://' + config.user + ':' + config.password +'@' + config.baseUrl + 'login/xmlrpc',
            methodName: 'ticket.create',
            // @TODO
            params: [
                    info.title,
                    info.description,
                    {
                        'owner': info.owner,
                        'trellocard': info.trellocard,
                        'cc': info.cc,
                        'component': '',
                        'milestone': formValue.milestone
                    },
                    false
                    ],
            success: function(response, status, jqXHR) {
                alert('Create ticket: ' + response);
                $el.parents('[data-trac-role="form-card"]').slideUp();
                $el.show();

            },
            error: function(jqXHR, status, error) {
                alert('Error on ticket creation');
            }
        });
    },

    sendCardAgile: function (cardId, boardId, formValue, $el) {
        var self = this;
        var dataRequest = {
            'board': boardId,
            'card': cardId,
            'milestone': formValue.milestone
        };
        if (config.agileTrac) {
            dataRequest.iteration = formValue.iteration
        }
        $.ajax({
            url: config.protocol + '://' + config.baseUrl + 'trello/sendtotrac',
            type: 'GET',
            data: dataRequest,
            dataType: 'text',
            success: function(response, status, jqXHR) {
                alert(response);
                $el.parents('[data-trac-role="form-card"]').slideUp();
                $el.show();
            },
            error: function(jqXHR, status, error) {
                alert('Error on ticket creation');
            }
        });
    },

    getCardInfo: function (shortId, callback) {
        $.ajax({
            dataType: 'json',
            type: 'GET',
            url: 'https://api.trello.com/1/cards/' + shortId,
            data: {
                key: config.key,
                token: config.token
            },
            success: function (data) {
                var status = callback(data);
            }
        });
        return status;
    },

    convertResponse: function (data) {
        // var size = data.name.match(/^\((\d+)\)/);
        // size = size[1];
        // var title = data.name.substring(size.length + 3);
        var title = data.name;
        // @TODO markdown to wiki
        var description = data.desc;
        // @TODO get trac user
        var owner = 'trello';
        // @TODO get trac user
        var cc = '';

        var info = {
            'title': title,
            'description': description,
            'owner': owner,
            'cc': cc,
            'trellocard': data.id
        }

        return info;
    },

    getFormValue: function (el) {
        var $parent = $(el).parent();
        var milestone = $parent.find('select[name="milestone-trac"]').val();
        var value = {
            'milestone': milestone
        };
        if (config.agileTrac) {
            var iteration = $parent.find('input[name="iteration-trac"]').val();
            value.iteration = iteration;
        }
        return value;
    }

}

// start
app.init();


(function($){
    var strLocation = window.location.href;
    var strHash = window.location.hash;
    var strPrevLocation = "";
    var strPrevHash = "";
    var intIntervalTime = 100;

    var fnCleanHash = function(strHash){
        return(strHash.substring(1, strHash.length));
    }

    var fnCheckLocation = function(){
        if (strLocation != window.location.href){
            strPrevLocation = strLocation;
            strPrevHash = strHash;
            strLocation = window.location.href;
            strHash = window.location.hash;
            $(window.location).trigger(
                "changeLocation",
                {
                    currentHref: strLocation,
                    currentHash: fnCleanHash( strHash ),
                    previousHref: strPrevLocation,
                    previousHash: fnCleanHash( strPrevHash )
                }
            );
        }
    }
    setInterval(fnCheckLocation, intIntervalTime);

})( jQuery );
