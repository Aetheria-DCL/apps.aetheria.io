import {AdminControls} from './adminControls';

class Toolbar
{
    constructor(socket)
    {
        socket.on("currentPrivateLandCount", this.updateLocalLandCount.bind(this));
        this.authResult = null;
        this.landCount = 0;
        this.adminControls = null;
    }

    updateLocalLandCount(newLandCount)
    {
        document.getElementById("privateLandCount").innerHTML = `You have ${newLandCount} private land remaining`
        this.landCount = newLandCount;
    }

    buildToolbar(authResult)
    {
        this.authResult = authResult;
        this.toolbar = document.createElement("center");
        this.toolbar.id = "toolbar";
        document.getElementsByTagName("body")[0].appendChild(this.toolbar);
        this.buildBasic(this.toolbar);
        if(authResult.isAdmin)
            this.buildAdmin(this.toolbar);
    }

    buildBasic(toolbar)
    {
        let titleContainer = document.createElement("div");
        let title = document.createElement("h3");
        title.innerHTML = "You are logged in as: " + this.authResult.addr.substring(0, 7) + "...";
        titleContainer.appendChild(title);
        titleContainer.appendChild(document.createElement("hr"))

        let landCount = document.createElement("p");
        landCount.id = "privateLandCount";
        landCount.innerHTML = "You have 0 private land remaining";

        let howto = document.createElement("p");
        howto.innerHTML = "Left click to move and Right click to place";

        toolbar.appendChild(titleContainer);
        toolbar.appendChild(landCount);
        toolbar.appendChild(howto)
        toolbar.appendChild(document.createElement("br"))
    }

    buildAdmin(toolbar)
    {
        let adminContainer = document.createElement("div");
        this.adminControls = new AdminControls(adminContainer);
        toolbar.appendChild(adminContainer);
    }

    buildControlList(controlList)
    {

    }

    get placementMode()
    {
        if(this.adminControls == null)
        {
            return "alloc";
        }
        else
        {
            return this.adminControls.placementMode;
        }
    }
}

export {Toolbar};