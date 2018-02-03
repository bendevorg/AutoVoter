exports.login = (VOTE_LIST_PAGE, LOGIN_PAGE, username, password, request) => {

    return new Promise((resolve, reject) => {

        var url = VOTE_LIST_PAGE;

        request.get({url: url}, function(err, httpResponse, html){

            if (err){

                return reject(err);

            } else {        

                var csrfKeyRegExp = new RegExp(/name="csrfKey" value="([^']*)">/);
                var refRegExp = new RegExp(/name="ref" value="([^']*)">/);
                var maxFileSizeRegExp = new RegExp(/name="MAX_FILE_SIZE" value="([^']*)">/);
                var pluploadRegExp = new RegExp(/name="plupload" value="([^']*)">/);

                var csrf = '';
                var ref = '';
                var maxFileSize = '';
                var plupload = '';

                if (!csrfKeyRegExp.test(html)) {

                    return console.log('Erro ao pegar o CRF para login');

                } else if (!refRegExp.test(html)){

                    return console.log('Erro ao pegar o REF para login');

                } else if (!pluploadRegExp.test(html)){

                    return console.log('Erro ao pegar o PLUPLOAD para login');

                } else if (!maxFileSizeRegExp.test(html)){

                    return console.log('Erro ao pegar o MAXFILESIZE para login');

                } else {

                    url = LOGIN_PAGE;

                    var csrfExpRes = csrfKeyRegExp.exec(html);
                    //  TODO: Melhorar isso
                    csrf = csrfExpRes[0].substring(22, 54);

                    var refExpRes = refRegExp.exec(html);
                    //  TODO: Melhorar isso
                    ref = refExpRes[0].substring(18, 54);

                    var maxFileSizeExpRes = maxFileSizeRegExp.exec(html);
                    maxFileSize = maxFileSizeExpRes[0].substring(28, 36);

                    var pluploadExpRes = pluploadRegExp.exec(html);
                    var plupload = pluploadExpRes[0].substring(23, 55);

                    var loginData = {
                        auth: username,
                        password: password,
                        login__standard_submitted: '1',
                        csrfKey: csrf,
                        ref: ref,
                        MAX_FILE_SIZE: maxFileSize,
                        plupload: plupload,
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
