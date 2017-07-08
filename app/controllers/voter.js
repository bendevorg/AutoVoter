var getVotes = require('./getVotes.js').getVotes;
var login = require('./login.js').login;

var url = '';
const NUMBER_OF_LOOPS_REQUIRED = 5;
const NUMBER_OF_WEBSITES_TO_VOTE = 6;
const VOTE_PAGE = 'https://panel.talonro.com/voting/';
const LOGIN_PAGE = 'https://forum.talonro.com/login/';

const TELEGRAM_CHAT_RAG = -194095782;
const TELEGRAM_URL = 'http://ec2-54-232-231-87.sa-east-1.compute.amazonaws.com:3101/telegram/message/chat'

const BETA_PAGES_REGEXP = [/name="token" value="([^"]+)">\n\t\t\t\t\t\t\t\t\t\t<input type="submit" value="TopG"/g,
/name="token" value="([^"]+)">\n\t\t\t\t\t\t\t\t\t\t<input type="submit" value="MmoToplist"/g,
/name="token" value="([^"]+)">\n\t\t\t\t\t\t\t\t\t\t<input type="submit" value="Top100Arena"/g,
/name="token" value="([^"]+)">\n\t\t\t\t\t\t\t\t\t\t<input type="submit" value="XtremeTop100"/g,
/name="token" value="([^"]+)">\n\t\t\t\t\t\t\t\t\t\t<input type="submit" value="GamesTop100"/g,
/name="token" value="([^"]+)">\n\t\t\t\t\t\t\t\t\t\t<input type="submit" value="GameSites100"/g];

var cron = require('node-cron');
var moment = require('moment');
var tz = require('moment-timezone');
moment.locale('pt-br');

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
            
            cron.schedule('*/5 */12 * * *', function(){
                voter(body.username.trim(), body.password.trim());
            });

        }
};

voter = (username, password) => {

    let request = require('request');
    request = request.defaults({jar: true});
    jar = request.jar();

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

                                    voteOnSite (html, 0, username, request, 0);
                                    
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

var voteOnSite = (tokenHtml, counter, username, request, voteLoopCounter) => {

    //  Vamos rodar o looping de votação 5 vezes para garantir que essa porcaria vote (problema do servidor dos caras)
    try {
        if (voteLoopCounter < NUMBER_OF_LOOPS_REQUIRED) {
            if (counter < NUMBER_OF_WEBSITES_TO_VOTE) {
                counter++;
                url = VOTE_PAGE;

                var headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded'
                };

                var tokenRegExp = new RegExp(BETA_PAGES_REGEXP[counter-1]);
                var token = tokenRegExp.exec(tokenHtml);

                if (token){
                    var voteFormData = {
                        site: counter,
                        token: token[1]
                    };

                    request.post({url: url, followAllRedirects: true, form: voteFormData, headers: headers}, function(err, httpResponse, html){
                        if (err){
                            console.log(err);
                            console.log('Erro ao votar no site número ' + voteFormData.site);
                        }
                    });
                    return voteOnSite(tokenHtml, counter, username, request, voteLoopCounter);
                } else {
                    return voteOnSite(tokenHtml, counter, username, request, voteLoopCounter);
                }
            } else {
                return voteOnSite(tokenHtml, 0, username, request, voteLoopCounter + 1);
            }
        } else {
            return finishVote(username, request);
        }
    }catch(e){
        return voteOnSite(tokenHtml, counter, username, request, voteLoopCounter);
    }   
}

var finishVote = (username, request) => {

    console.log('Votação efetuada para a conta ' + username);

    //  Soma 12 horas para indicar o próximo vote
    var confirmationMessage = {
        message: 'Votação realizada para a conta ' + username + '\nPróxima votação ocorrerá ' + moment().tz('America/Sao_Paulo').add(12, 'hours').add(5, 'minutes').calendar().toLowerCase(),
        chatId: TELEGRAM_CHAT_RAG
    };

    getVotes(VOTE_PAGE, request).then((votes) => {

        confirmationMessage.message += '\n\nTotal de pontos: ' + votes;
        sendTelegramMessage(confirmationMessage, request);

    }, (err) => {

        confirmationMessage.message += '\n\nNão foi possível apurar o total de pontos';
        sendTelegramMessage(confirmationMessage, request);

    });

}

var getToken = (html) => {
    var tokenRegExp = new RegExp(BETA_PAGES_REGEXP[counter-1]);
    var token = getToken(html)

    if (token){

        return {
            site: counter,
            token: token[1]
        };

    } else {

        return undefined;

    }
};

var sendTelegramMessage = (message, request) => {

    request.post({url: TELEGRAM_URL, form: message}, function(err, httpResponse, html){});

};
