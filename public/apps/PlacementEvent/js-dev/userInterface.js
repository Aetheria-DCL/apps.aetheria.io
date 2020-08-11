import {Map} from './map';
import {Toolbar} from './toolbar';
import {ClaimLandUI} from './claimLand';
class UserInterface {
    constructor(socket, mmI)
    {
        this.toolbar = new Toolbar(socket);
        this.landClaimButton = new ClaimLandUI(socket, mmI);
        this.map = new Map({
            socket: socket,
            height: "100%",
            width: "100%",
            boundingBox: { //in plots not pixels
                xMin: 0, 
                xMax: 90,

                yMin: 0,
                yMax: 90
            },
            datumPoint: {
                x: 62,
                y: 59
            },
            colourScheme: {
                gridLines: 'rgb(24,20,26)',
                background: 'rgb(61, 58, 70)',
                defaultCursorStyle: 'rgba(0,255,0,.5)',
                errorCursorStyle: 'rgba(255,0,0,.5)',
                yourPlot: 'rgb(0,211,255)',
                privatePlot: 'rgb(80,84,212)',
                road: 'rgb(113,108,122)',
                community: 'rgb(112,172,118)',
                plaza: 'rgb(173,201,167)'
            },
            toolbar: this.toolbar
        });
    }

    authed(result)
    {
        if(!result.isSuccess)
            return;
        this.toolbar.buildToolbar(result);
        this.landClaimButton.initButton(result);
        this.map.start(result);
    }
}

export {UserInterface}
