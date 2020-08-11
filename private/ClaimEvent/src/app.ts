import {PlacementDatabaseConnection} from './PlacementDatabaseConnection';
import {Server} from './Server';
import {Authenticator} from './Auth';
import {ClaimHandler} from './ClaimHandler';

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
        new ClaimHandler(authenticator, databaseConnection);
    }
}

new App();