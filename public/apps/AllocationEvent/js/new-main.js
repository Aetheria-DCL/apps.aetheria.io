/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//GlobalVariables
var DEBUG = 0;
console.log(DEBUG)
var socket;
if (DEBUG > 0) {
    socket = io("localhost:10000");
} else {
    socket = io("dev.aetheria.io:10000");
}

var LeftIntervalID = 0;
var LandCount;
var PrivateLandCount;
var PlotCount = 1;

const reducer = (accumulator, currentValue) => accumulator + currentValue;

//Functions

function SaveForm() {
    inputs = $("input, textarea")
    formData = []
    for(i=0; i<inputs.length; i++) {
        formData.push(inputs[i].id + "|" + inputs[i].value);
    }
    localStorage.plotCount = PlotCount;
    localStorage.formData = formData.toString();
}

function StorageToForm() {
    if(localStorage.formData == undefined)
        return;
    for(i=1; i<localStorage.plotCount; i++) {
        AddPlot(); //Add plots until we hit PlotCount in formData
    }
    formData = localStorage.formData.split(",")
    for(i=0; i<formData.length; i++) {
        x = formData[i].split("|")
        if(x == "")
            continue;
        try {
            $("#" + x[0]).val(x[1])
        } catch (error) {
            console.log("Ignoring LocalStorage Encoding Error")
        }
    }
    RunLeftChecks();
    RunRightChecks(); //allow the form to update
}

function FormHasClosed() {
    $("#left").css("display", "none");
    $("#right").css("display", "none");
    $("#ERROR-FHC").css("display", "block");
    window.location.href = "https://apps.aetheria.io/AllocationEvent/End.html"
}

function NoLogin() {
    $("#left").css("display", "none");
    $("#right").css("display", "none");
    $("#ERROR-NW3").css("display", "block");
}

function NoLand() {
    $("#left").css("display", "none");
    $("#right").css("display", "none");
    $("#ERROR-NL").css("display", "block");
}

function NoServer() {
    $("#left").css("display", "none");
    $("#right").css("display", "none");
    $("#ERROR-NS").css("display", "block");
}

function AccountLock() {
    $("#left").css("display", "none");
    $("#right").css("display", "none");
    $("#ERROR-AL").css("display", "block");
}

function LogedIn(callback) { //Main Form Code
    $('#left').css("display", "block");
    $('#right').css("display", "none");

    account = web3.eth.accounts[0];
    socket.emit("GetLandCount", {
        addr: account
    });
    socket.on("LandCount", function(data) {
        LandCount = data;
        if(LandCount == null) {
            NoLand();
            return;
        }
        YHL = "You Have " + data + " LAND";
        console.log(YHL);
        $("#LandText").html(YHL);
        callback();
    });
    if (DEBUG >= 2) {
        LandCount = 10;
        YHL = "You Have " + LandCount + " LAND";
        $("#LandText").html(YHL);
        callback(); //for when we have no server
    }
}

function SetupListeners() {
    // $('#PrivateLand-input').on('input', RunLeftChecks);
    // $('#PublicLand-input').on('input', RunLeftChecks);
    $('.left-input-required').on('input', RunLeftChecks);
    $('#Selections').on('input', RunRightChecks);
}

function RunLeftChecks() {
    SaveForm();//save
    //stuff
    PrivateLandCount = $('#PrivateLand-input').val();
    //checks
    if (parseInt($("#PrivateLand-input").val()) + parseInt($('#PublicLand-input').val()) !== LandCount) {
        $("#left-button").attr("disabled", true);
        return;
    }
    if ($("#PrivateLand-input").val() < 0 || $('#PublicLand-input').val() < 0) {
        $("#left-button").attr("disabled", true);
        return;
    }
    if ($("#email-input").val() == "") {
        $("#left-button").attr("disabled", true);
        return;
    }
    discordIDReg = /(.+)+(#)[0-9]{4}/i
    DCIDVal = $("#DCID-input").val()
    DCIDMatches = DCIDVal.match(discordIDReg);
    if(DCIDMatches == undefined) {
        $("#left-button").attr("disabled", true);
        return;
    }
    if(DCIDMatches.indexOf(DCIDVal) < 0) {
        $("#left-button").attr("disabled", true);
        return;
    }
    $('#left-button').attr("disabled", false);
}

function RunRightChecks() {
    SaveForm(); //save
    LandSize = [];
    for (i = 0; i < PlotCount; i++) {
        x = $('#Sel' + i + 'X').val();
        y = $('#Sel' + i + 'Y').val();
        LandSize[i] = x * y;
        $('#Sel' + i).html(LandSize[i]);
    }
    Remaining = PrivateLandCount - LandSize.reduce(reducer);
    if (Remaining === 0)
        $('#PrivateLand-count').css("color", "green");
    else if (Remaining > 0)
        $('#PrivateLand-count').css("color", "white");
    else
        $('#PrivateLand-count').css("color", "red");
    $('#PrivateLand-count').html(Remaining);

    disableright = function() {
        $("#right-button").attr("disabled", true)
    };
    //checks
    if (Remaining !== 0) {
        $("#right-button").attr("disabled", true);
        return;
    }
    $("#right-button").attr("disabled", false);

}

function AddPlot() {
    //Custom Expression parser
    templateString = $("#Selection-Template").html();
    newString = templateString;
    mappingDict = {
        "ID": PlotCount,
        "P1ID": PlotCount+1
    }
    for (var key in mappingDict)
    {
        exp = '#'+key+'#'
        newString = newString.replace(new RegExp(exp, 'g'), mappingDict[key]);
    }
    console.log(newString)
    //inserting the evaluated template
    newHTML = $.parseHTML(newString);
    $("#Selections").append(newHTML);
    PlotCount++;
}

function RemovePlot() {
    if (PlotCount == 1)
        return;
    idToRemove = `#Selection${PlotCount-1}`
    $(idToRemove).remove();
    PlotCount--;
}

function SetupRightSide() {
    IsOnRight = true;
    $('#left').css("display", "none");
    $('#right').css("display", "block");

    $("#sel-add").on("click", AddPlot);
    $("#sel-rem").on("click", RemovePlot);

    //Finaly
    setInterval(RunRightChecks, 500);
}

function Commit() {
    var form = {
        addr: "",
        email: "",
        DCID: "",
        public: 0,
        private: 0,
        descrip: "",
        links: "",
        plots: []
    };
    form.addr = web3.eth.accounts[0];
    form.public = parseInt($("#PublicLand-input").val());
    form.private = parseInt($("#PrivateLand-input").val());
    form.descrip = $("#Descrip-text").val();
    form.links = $("#Links-text").val();
    form.email = $("#email-input").val();
    form.DCID = $("#DCID-input").val();

    for (i = 0; i < PlotCount; i++) {
        form.plots[i] = {
            x: parseInt($("#Sel" + i + "X").val()),
            y: parseInt($("#Sel" + i + "Y").val())
        };
    }

    stringform = JSON.stringify(form);
    console.log(stringform);
    msg = w3.sha3(stringform);
    w3.personal.sign(msg, web3.eth.accounts[0], "", (err, sig)=>{
        socket.emit("FormSubmit", {
            "form": stringform,
            "sig": sig
        });
    });

    
    socket.on("DidItWork", function (data) {
        if(data)
        {
            window.location.href = './thankyou.html'
        }
        else
        {
            alert("Something went wrong");
        }
    });
}


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

//Start
NoServer(); //set this error for default
socket.on('connect', function() {
    $("#ERROR-NS").css("display", "none");
    socket.on('IsLocked', AccountLock)
    socket.on('disconnect', NoServer);
    socket.on('ClosingTime', FormHasClosed);
    socket.emit()
    if (typeof w3 !== "undefined") {
        w3.eth.getAccounts(function(err, accounts) {
            if (err != null) {
                console.error("An error occurred: " + err);
            } else if (accounts.length == 0) {
                NoLogin();
            } else {
                LogedIn(() => {
                    StorageToForm(); //load up previous entries
                    SetupListeners();
                });
            }
        });
    } else {
        NoLogin();
    }
});
