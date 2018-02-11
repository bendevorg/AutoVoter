exports.login = (FORUM_PAGE, LOGIN_PAGE, username, password, request) => {

    return new Promise((resolve, reject) => {

        var url = FORUM_PAGE;

        request.get({url: url}, function(err, httpResponse, html){

            if (err){

                return reject(err);

            } else {        

                var csrfKeyRegExp = new RegExp(/name="csrfKey" value="([^']*)">/);
                var csrf = '';

                if (!csrfKeyRegExp.test(html)) {

                    console.log('Erro ao pegar o CRF para login');
                    // For now i will assume we are already logged in and we have some problems with the request component
                    return resolve(request);

                } else {

                    url = LOGIN_PAGE;

                    var csrfExpRes = csrfKeyRegExp.exec(html);
                    //  TODO: Melhorar isso
                    csrf = csrfExpRes[0].substring(22, 54);

                    var loginData = {
                        login__standard_submitted: '1',
                        csrfKey: csrf,
                        auth: username,
                        password: password,
                        remember_me: 0,
                        remember_me_checkbox: 1
                    };

                    request.post({url: url, followAllRedirects: true, form: loginData}, function(err, httpResponse, html){
                        if (err){

                            return reject(err);

                        } else {
                            return resolve(request);
                        }
                    });
                }
            }
        });
    });
};
