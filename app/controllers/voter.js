var request = require('request');
request = request.defaults({jar: true});
jar = request.jar();

exports.vote = (req, res) => {

    var body = _.pick(req.body, 'username', 'password');

        if (!_.isString(body.username) || body.username.trim().length == 0){

            return res.status(400).json({msg: 'Invalid username'});
            
        } else if (!_.isString(body.password) || body.password.trim().length == 0){

            return res.status(400).json({msg: 'Invalid password'});

        } else {

            var loginUrl = 'https://forum.talonro.com/login/';
            var loginData = {
                auth: body.username.trim(),
                password: body.password.trim(),
                login__standard_submitted: '1',
                csrfKey: '4d25b2fee44a8a1fe7dfeb6bd3a85140',
                ref: 'aHR0cHM6Ly9wYW5lbC50YWxvbnJvLmNvbS92b3RpbmcvP19mcm9tTG9naW49MQ=='
            };

            request.post({url: loginUrl, form: loginData}, function(err, httpResponse, body){

            console.log(httpResponse);
            console.log(body);

            });

        }

}