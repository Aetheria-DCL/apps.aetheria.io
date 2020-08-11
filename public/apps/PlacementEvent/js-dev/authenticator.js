import Swal from './lib/Swal'; //sweet alert


class Authenticator
{
    constructor(socket, web3Instance, callback)
    {
        this.callback = callback;
        this.web3Instance = web3Instance;
        this.socket = socket;
    }

    startAuth()
    {
        this.createAuthPopUp().then(this.startAuthentication.bind(this)).then(this.callback);
    }

    createAuthPopUp(onClick)
    {
        return new Promise(((res) => {
            Swal.fire({
                title: 'Authentication Required',
                text: 'please make sure you are logged in with your contributing account',
                showCancelButton: true,
                confirmButtonText: 'Authenticate',
                cancelButtonText: 'Go back to the home page',
                reverseButtons: true
            }).then(((result) => {
                if(result.value)
                {
                    res();
                }
                else
                {
                    document.location = "https://aetheria.io/";
                }
            }).bind(this));
        }).bind(this))
    }

    async startAuthentication()
    {
        this.socket.on('authError', (res) => {
            alert(res);
            //history.back();
        })
        let address = this.web3Instance.getMainAccount();
        this.socket.emit("startAuth", address);
        let authChallange = await this.socketWaitFor(this.socket, "authChallange");
        let sig = await this.web3Instance.requestSigning(authChallange, address);
        this.socket.emit("authAttempt", sig);
        let result = await this.socketWaitFor(this.socket, "authResult");
        if (result.isSuccess) {
            this.makeSuccessPopup();
        }
        else {
            this.makeFailPopup();
        }
        return result;
    }

    makeSuccessPopup()
    {
        Swal.fire(
            'Welcome..',
            'You may proceed',
            'success'
          )
    }

    makeFailPopup()
    {
        Swal.fire(
            'Please Retry',
            'Your authentication attempt has failed',
            'fail'
          )
    }

    socketWaitFor(socket, subject)
    {
        return new Promise((res) => {
            socket.once(subject, (data) => {
                res(data);
            })
        })
    }
}

export {Authenticator};