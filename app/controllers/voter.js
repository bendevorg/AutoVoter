var request = require('request');
request = request.defaults({jar: true});
jar = request.jar();

var url = '';
const NUMBER_OF_WEBSITES_TO_VOTE = 5;

exports.vote = (req, res) => {

    var body = _.pick(req.body, 'username', 'password');

        if (!_.isString(body.username) || body.username.trim().length == 0){

            return res.status(400).json({msg: 'Invalid username'});
            
        } else if (!_.isString(body.password) || body.password.trim().length == 0){

            return res.status(400).json({msg: 'Invalid password'});

        } else {

            res.status(200).json({
                msg: 'Looping de votação iniciado'
            });

            var interval = 10;

            var loopVote = setInterval(() => {
     
                try {

                    url = 'https://panel.talonro.com/voting/';

                    request.get({url: url}, function(err, httpResponse, html){

                        if (err){

                            console.log('Erro ao acessar o painel inicial');
                            clearInterval(loopVote);

                        } else {        

                            var csrfKeyRegExp = new RegExp(/name="csrfKey" value="([^']*)">/);
                            var refRegExp = new RegExp(/name="ref" value="([^']*)">/);

                            var csrf = '';
                            var ref = '';

                            if (!csrfKeyRegExp.test(html)) {

                                console.log('Erro ao pegar o CRF para login');
                                clearInterval(loopVote);

                            } else if (!refRegExp.test(html)){

                                console.log('Erro ao pegar o REF para login');
                                clearInterval(loopVote);

                            } else {

                                url = 'https://forum.talonro.com/login/';

                                var csrfExpRes = csrfKeyRegExp.exec(html);
                                //  TODO: Melhorar isso
                                csrf = csrfExpRes[0].substring(22, 54);

                                var refExpRes = refRegExp.exec(html);
                                //  TODO: Melhorar isso
                                ref = refExpRes[0].substring(18, 62);

                                var loginData = {
                                    auth: body.username.trim(),
                                    password: body.password.trim(),
                                    login__standard_submitted: '1',
                                    csrfKey: csrf,
                                    ref: ref
                                };

                                request.post({url: url, followAllRedirects: true, form: loginData}, function(err, httpResponse, html){

                                    if (err){

                                        console.log('Erro ao realizar o login');
                                        clearInterval(loopVote);

                                    } else {

                                        url = 'https://panel.talonro.com/voting/';
                                        var votingData = {
                                            agree_vote: 1
                                        };

                                        request.post({url: url, followAllRedirects: true, form: votingData}, function(err, httpResponse, html){

                                            if (err){

                                                console.log('Erro ao acessar a página de votação');
                                                clearInterval(loopVote);

                                            } else {

                                                url = 'https://panel.talonro.com/voting/';
                                                var counter = 0;

                                                while (counter <= NUMBER_OF_WEBSITES_TO_VOTE){

                                                    request.get({url: url + counter, followAllRedirects: true}, function(err, httpResponse, html){

                                                        if (err){

                                                            console.log('Erro ao votar no site número ' + counter);
                                                            clearInterval(loopVote);

                                                        }

                                                    });

                                                    counter++;

                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });

                    interval = 43380000;

                } catch (e){

                    console.log('Ih bixo erro não tratado: ' + e);
                    clearInterval(loopVote);

                }

            }, interval);
        }
}