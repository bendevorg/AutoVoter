var request = require('request');
request = request.defaults({jar: true});
jar = request.jar();

var url = '';
const NUMBER_OF_WEBSITES_TO_VOTE = 6;
const VOTE_PAGE = 'https://panel.talonro.com/voting/';
const LOGIN_PAGE = 'https://forum.talonro.com/login/';

var cron = require('node-cron');

exports.voteOnce = (req, res) => {

    var body = _.pick(req.body, 'username', 'password');

        if (!_.isString(body.username) || body.username.trim().length == 0){

            return res.status(400).json({msg: 'Username inválido'});
            
        } else if (!_.isString(body.password) || body.password.trim().length == 0){

            return res.status(400).json({msg: 'Password inválido'});

        } else {

            res.status(200).json({
                msg: 'Votação efetuada.'
            });
            
            voter(body.username.trim(), body.password.trim());

        }
};

exports.voteLoop = (req, res) => {

    var body = _.pick(req.body, 'username', 'password');

        if (!_.isString(body.username) || body.username.trim().length == 0){

            return res.status(400).json({msg: 'Username inválido'});
            
        } else if (!_.isString(body.password) || body.password.trim().length == 0){

            return res.status(400).json({msg: 'Password inválido'});

        } else {

            res.status(200).json({
                msg: 'Looping de votação iniciada.'
            });
            
            cron.schedule('5 */12 * * *', voter(body.username.trim(), body.password.trim()));

        }
};

voter = (username, password) => {

    try {

        url = VOTE_PAGE;

        console.log('Votando com o ' + username);

        request.get({url: url}, function(err, httpResponse, html){

            if (err){

                return console.log('Erro ao acessar o painel inicial');

            } else {        

                var csrfKeyRegExp = new RegExp(/name="csrfKey" value="([^']*)">/);
                var refRegExp = new RegExp(/name="ref" value="([^']*)">/);

                var csrf = '';
                var ref = '';

                if (!csrfKeyRegExp.test(html)) {

                    return console.log('Erro ao pegar o CRF para login');

                } else if (!refRegExp.test(html)){

                    return console.log('Erro ao pegar o REF para login');

                } else {

                    url = LOGIN_PAGE;

                    var csrfExpRes = csrfKeyRegExp.exec(html);
                    //  TODO: Melhorar isso
                    csrf = csrfExpRes[0].substring(22, 54);

                    var refExpRes = refRegExp.exec(html);
                    //  TODO: Melhorar isso
                    ref = refExpRes[0].substring(18, 62);

                    var loginData = {
                        auth: username,
                        password: password,
                        login__standard_submitted: '1',
                        csrfKey: csrf,
                        ref: ref
                    };

                    request.post({url: url, followAllRedirects: true, form: loginData}, function(err, httpResponse, html){

                        if (err){

                            return console.log('Erro ao realizar o login');

                        } else {

                            //  TODO: Verificar se o login realmente foi feito

                            url = VOTE_PAGE;
                            var votingData = {
                                agree_vote: '1'
                            };

                            request.post({url: url, followAllRedirects: true, form: votingData}, function(err, httpResponse, html){

                                if (err){

                                    return console.log('Erro ao acessar a página de votação');

                                } else {

                                    url = VOTE_PAGE;
                                    var counter = 0;

                                    while (counter < NUMBER_OF_WEBSITES_TO_VOTE){

                                        request.get({url: url + counter, followAllRedirects: true}, function(err, httpResponse, html){

                                            if (err){

                                                console.log('Erro ao votar no site número ' + counter);

                                            }

                                            //  TODO: Verificar se a votacao realmente foi feita

                                        });

                                        counter++;

                                    }

                                    console.log('Votação finalizada com o ' + username);

                                }
                            });
                        }
                    });
                }
            }
        });

    } catch (e){

        return console.log('Erro não tratado: ' + e);

    }

};
