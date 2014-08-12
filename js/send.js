var app = {

    init: function () {
        var self = this;
        this.getActiveMilestones(function (data) {
            $(window).ready(function () {
                // append button
                self.appendButton(data);

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
            });
        });
    },

    appendButton: function (milestones) {
        $('.list-card').each(function() {
            $this = $(this);
            var href = $this.find('a.list-card-title').attr('href');
            var attr = href.split('/');
            var iteration = '';
            var milestoneOptions = new Array();
            for (var i = 0; i < milestones.length; i++) {
                milestoneOptions.push('<option value="' + milestones[i] + '">' + milestones[i] + '</option>');
            }
            if (config.agileTrac) {
                iteration = '<label for="iteration-trac">Iteration</label>\
                            <input name="iteration-trac" />';
            }
            $this.before('\
                <div style="background-color: #ccc; padding: 5px;">\
                    <a style="text-decoration: none" data-trac-role="open" href="#">SendToTrac</a>\
                    <div data-trac-role="form-card" style="display:none">\
                        <a style="float: right" data-trac-role="close">X</a>\
                        <form>\
                            <label for="milestone-trac">Milestone</label>\
                            <select style="width: 200px" name="milestone-trac">\
                            ' + milestoneOptions + '\
                            </select>\
                            ' + iteration + '\
                            <a style="background-url: gray;float: right" data-trac-role="send" data-trac-cardid="' + attr[2] + '">send</a>\
                            <br/>\
                        </form>\
                    </div>\
                </div>\
            ');
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
                console.log(response);
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
