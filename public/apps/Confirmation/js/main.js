socket = io("dev.aetheria.io:10001");
window.key = "";

if (window.ethereum) {
    window.w3 = new Web3(ethereum);
    try {
        // Request account access if needed
        ethereum.enable();
    } catch (error) {
        window.history.back();
    }
}
// Legacy dapp browsers...
else if (window.web3) {
    window.w3 = new Web3(web3.currentProvider);
}

socket.on('connect', function() {
    socket.on("newKey", (key) => {
        window.key = key;
        w3.eth.getAccounts(function(err, accounts) {
            if (err != null) {
                Swal({
                    type: 'error',
                    title: 'Error...',
                    text: 'Please Shout At Alonzo On Discord'
                });
            }
            else if(accounts.length == 0)
            {
                Swal({
                    type: 'error',
                    title: 'Web3 Not Enabled',
                    text: 'Please Enable MetaMask And Reload'
                });
            } else {
                w3.personal.sign(window.key, accounts[0], "", (err, sig)=>{
                    socket.emit("authAttempt", {
                        "key": window.key,
                        "sig": sig
                    });
                });
            }
        });
    });

    socket.on("authFail", (type) => {
        console.log(type);
        switch(type)
        {
            case "Invalid Key":
                Swal({
                    type: 'error',
                    title: 'Auth Key Timed Out',
                    text: 'Please Reload'
                });
                break;
            case "Invalid Address":
                Swal({
                    type: 'error',
                    title: 'Your Address Does Not Exist',
                    text: 'Please make sure your using the correct address'
                })
                break;
        }
    });

    socket.on("Results", (data) => {
        if(data.wasApproved)
        {
            $("#approved").html("You have been Selected");
            $("#approved").attr("style", "color: green");
        }

        $("#addr").html(data.results.addr);
        $("#private").html("Private Contrib: " + data.results.private);
        $("#public").html("Public Contrib: " + data.results.public);
    });
});