exports.login = (VOTE_PAGE, LOGIN_PAGE, username, password, request) => {

    return new Promise((resolve, reject) => {

        var url = VOTE_PAGE;

        request.get({url: url}, function(err, httpResponse, html){

            if (err){

                return reject(err);

            } else {        

                var csrfKeyRegExp = new RegExp(/name="csrfKey" value="([^']*)">/);
                var refRegExp = new RegExp(/name="ref" value="([^']*)">/);

                var csrf = '';
                var ref = '';

                if (!csrfKeyRegExp.test(html)) {

                    return reject(err);

                } else if (!refRegExp.test(html)){

                    return reject(err);

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
