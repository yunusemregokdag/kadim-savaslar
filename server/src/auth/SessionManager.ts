
interface GameSession {
    socketId: string;
    userId: string;
    zoneId: number;
    connectedAt: number;
}

export class SessionManager {
    // Bi-directional maps for O(1) lookups
    private socketToSession: Map<string, GameSession> = new Map();
    private userToSession: Map<string, GameSession> = new Map();

    /**
     * Registers a new authenticated session.
     * Enforces Single-Device Policy (kicks old connection).
     */
    public addSession(socketId: string, userId: string, zoneId: number): string | null {
        // 1. Kick existing user connection
        const oldSession = this.userToSession.get(userId);
        let oldSocketId: string | null = null;

        if (oldSession) {
            console.warn(`♻️ Duplicate Login: Kicking socket ${oldSession.socketId} for user ${userId}`);
            this.removeSession(oldSession.socketId);
            oldSocketId = oldSession.socketId;
        }

        // 2. Register New
        const session: GameSession = {
            socketId,
            userId,
            zoneId,
            connectedAt: Date.now()
        };

        this.socketToSession.set(socketId, session);
        this.userToSession.set(userId, session);

        return oldSocketId; // Return old socket ID so caller can emit force-disconnect
    }

    public removeSession(socketId: string) {
        const session = this.socketToSession.get(socketId);
        if (session) {
            this.userToSession.delete(session.userId);
            this.socketToSession.delete(socketId);
        }
    }

    public getSession(socketId: string): GameSession | undefined {
        return this.socketToSession.get(socketId);
    }

    public getSocketId(userId: string): string | undefined {
        return this.userToSession.get(userId)?.socketId;
    }
}
