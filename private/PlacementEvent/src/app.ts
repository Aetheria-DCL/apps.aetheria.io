import {PlacementDatabaseConnection} from './PlacementDatabaseConnection';
import {Server} from './Server';
import {Authenticator} from './Auth';
import {PlacementProccessor} from './PlacementProccessor';

class App {
    constructor()
    {
        this.start();
    }

    async start()
    {
        let databaseConnection = new PlacementDatabaseConnection();
        await databaseConnection.finished();
        let server = new Server();
        let io = server.io;
        let authenticator = new Authenticator(io, databaseConnection);
        let placementProccessor = new PlacementProccessor(authenticator, databaseConnection);
        placementProccessor.logger = console.log; //setup logging
    }
}

new App();