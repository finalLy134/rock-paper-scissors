export type Room = {
    code: string,
    hostId: any,
    joinerId: any,
    choices: Record<string, string>,
    status: 'waiting' | 'started' | 'finished'
}