exports.getVotes = (VOTE_PAGE, request) => {

    return new Promise((resolve, reject) => {

        url = VOTE_PAGE;

        request.get({url: url, followAllRedirects: true}, (err, httpResponse, html) => {

            if (err) {

                return reject(err);

            } else {

                try {

                    var votesRegExp = new RegExp(/<strong>([^"]+)<\/strong>/);
                    var votes = votesRegExp.exec(html)[1];
                    
                    return resolve(votes);

                } catch (e) {

                    return reject (e);

                }           
            }
        });
    });
};
