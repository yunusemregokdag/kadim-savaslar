import { CharacterClass } from '../types';

export interface PartyMember {
    id: string;
    nickname: string;
    class: CharacterClass;
    level: number;
    hp: number;
    maxHp: number;
    isLeader: boolean;
}

export interface Party {
    id: string;
    leaderId: string;
    members: PartyMember[];
}
