var app = {

    init: function () {
        var self = this;

        $(window).ready(function () {

            // append button
            self.appendButton();

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
                self.getCardInfo();
                self.sendCard();
            });

        });
    },

    appendButton: function () {
        $('.list-card').each(function() {
            $this = $(this);
            var href = $this.find('a.list-card-title').attr('href');
            var attr = href.split('/');

            $this.before('\
                <div style="background-color: yellow"><a data-trac-role="open" href="#">SendToTrac</a>\
                    <div data-trac-role="form-card" style="display:none">\
                        <a data-trac-role="send" data-trac-cardid="' + attr[2] + '">send-to-trac</a>\
                        <div data-trac-role="close">close</div>\
                    </div>\
                </div>\
            ');
        });
    },

    sendCard: function () {
        $.xmlrpc({
            url: config.protocol + '://' + config.user + ':' + config.password +'@' + config.loginUrl,
            methodName: 'ticket.create',
            params: ['Test', 'description', {'owner': 'trello'}, false],
            success: function(response, status, jqXHR) {
                console.log(response);
                alert('Create ticket: ' + response);
            },
            error: function(jqXHR, status, error) {
                console.log(response);
                alert('Error on ticket creation');
            }
        });
    },

    getCardInfo: function () {
        console.log('--------------------------getCardInfo');
    }


}


app.init();
