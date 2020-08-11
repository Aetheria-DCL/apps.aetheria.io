/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var socket = io("aetheria.io:3000");

var LeftIntervalID = 0;
var IsOnRight= false;
var LandCount;

//TDLH.VarLink.loop();
//TDLH.LiveLambdaVar.loop();
    TDLH.LiveLambdaVar.addVariable("LiveRightRemaining", function () {return $("#PrivateLand-input").val()});
    TDLH.VarLink.link("TDLH.LiveLambdaVar.results.LiveRightRemaining", ["LiveRightRemaining"])
web3.eth.getAccounts(function(err, accounts){
    if (err != null) console.error("An error occurred: "+err);
    else if (accounts.length == 0) NoLogin();
    else LogedIn();
});

function NoLogin() {
    document.getElementById("left").style.display = "none";
    document.getElementById("right").style.display = "none";
    document.getElementById("ERROR-NMM").style.display = "block";
}

function LogedIn() { //Main Forum Code    
    account = web3.eth.accounts[0];
    socket.emit("GetLandCount", {addr: account});
    socket.on("LandCount", function(data) {
        LandCount = data;
        YHL = "You Have " + data + " LAND";
        console.log(YHL);
        document.getElementById("LandText").innerHTML = YHL;
    });
    setInterval(RunLeftChecks, 100);
}

function RunLeftChecks() {
    //checks
    if(parseInt($("#PrivateLand-input").val()) + parseInt($('#PublicLand-input').val()) !== LandCount)
    {
        $("#left-button").attr("disabled", true);
        return;
    }
    if($("#PrivateLand-input").val() < 0 || $('#PublicLand-input').val() < 0)
    {
        $("#left-button").attr("disabled", true);
        return;
    }
    $('#left-button').attr("disabled", false); 
}

function StartRightSide() {
    //RightIntervalID = setInterval(RunRightChecks, 10);
    document.getElementById('left').style.display = 'none';
    document.getElementById('right').style.display = 'block';
    for(i = 0; i < 5; i++) {
    TDLH.LiveLambdaVar.addVariable("Sel" + i, function () {
        arr = []
        arr.push($('#Sel'+ i +'X').val() * $("#Sel"+ i +"Y"));            
        return arr;
    });
    }
    for(i = 0; i < 5; i++) {
        TDLH.VarLink.link("TDLH.LiveLambdaVar.results.Sel" + i, ["Sel" + i]);
    }
}
//


function RunRightChecks() {
    
}

function Comit() {
    var form = {addr: "", public: 0, private: 0, descrip: "", plots: []};
    form.addr = web3.eth.accounts[0];
    form.public = parseInt($("#PublicLand-input").val());
    form.private = parseInt($("#PrivateLand-input").val());
    form.descrip = $("#Descrip").val();
    for(i = 0; i < 5; i++)
    {       
        form.plots[i] = {x: parseInt($("#Sel" + i + "X").val()), y: parseInt($("#Sel" + i + "Y").val())}; 
    }
    
    stringform = JSON.stringify(form);
    msg = web3.sha3(stringform);
    signature = web3.eth.sign(web3.eth.accounts[0], msg, function() {
        socket.emit("FormSubmit", {"form": stringform, "sig": signature});
    });
}

socket.on("DidItWork", function(Worked) {
   if(!Worked)
       alert("We encontered an error please try again later");
   window.location = "http://aetheria.io";
});