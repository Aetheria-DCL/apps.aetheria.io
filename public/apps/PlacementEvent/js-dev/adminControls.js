class AdminControls
{
    constructor(adminContainer)
    {
        this.controlIndex = 0;
        this.controlList = [
            "alloc",
            "plaza",
            "road",
            "community",
            "adminRemove"
        ]
        this.displayedControlNames = [
            "privatePlacement",
            "plaza",
            "road",
            "community",
            "adminRemove"
        ]
        this.adminControlSignals = [];
        this.buildElements(adminContainer);
        this.setupFunctionControls();
        
    }

    get placementMode()
    {
        return this.controlList[this.controlIndex];
    }

    buildElements(adminContainer)
    {
        let controlElement = document.createElement("ul");
        controlElement.id = "controlList"
        this.displayedControlNames.forEach(((name, index) => {
            let currentElement = document.createElement("li");
            currentElement.class = "Control";

            let controlSignal = document.createElement("input");
            controlSignal.type = "radio";
            controlSignal.id = index;
            controlSignal.class = "adminControls";

            this.adminControlSignals.push(controlSignal);

            currentElement.appendChild(controlSignal);
            currentElement.appendChild(document.createTextNode(name));

            controlElement.appendChild(currentElement)
        }).bind(this));
        adminContainer.appendChild(controlElement);
    }

    setupFunctionControls()
    {
        this.adminControlSignals[0].checked = true;
        window.addEventListener("keydown", this.onKeyPress.bind(this))
    }

    onKeyPress(evt)
    {
        if(evt.key != "ArrowDown" && evt.key != "ArrowUp")
            return; //not up or down
        let isUp = evt.key == "ArrowUp"
        let previousIndex = this.controlIndex;
        if(isUp)
        {
            if(this.controlIndex != 0)
                this.controlIndex = (this.controlIndex - 1);
        }
        else
        {
            if(this.controlIndex != this.controlList.length-1)
                this.controlIndex = (this.controlIndex + 1);
        }
        this.recomputeSignals(previousIndex, this.controlIndex);
    }

    recomputeSignals(pre, post)
    {
        this.adminControlSignals[pre].checked = false;
        this.adminControlSignals[post].checked = true;
    }
}

export {AdminControls};