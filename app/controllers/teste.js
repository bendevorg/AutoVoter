exports.test = (req, res) => {

    res.status(200).json({
        data: 'Yey'
    });

    var x = 0;

    var loopVote = setInterval(() => {

        if (x > 5){

            clearInterval(loopVote);

        }

        console.log("I am doing my loop check " + x);
        x++;

    }, 10000);

}