// Importing necessary modules and types from Azle and other libraries
import {$update, $query, Result, nat64, ic, Opt, Principal, Record, match, StableBTreeMap, Vec} from "azle";
import { v4 as uuidv4 } from "uuid";

/**
 * Represents a personal time capsule.
 * @typedef {Object} TimeCapsule
 * @property {string} id - The unique identifier of the time capsule.
 * @property {string} message - The message stored in the time capsule.
 * @property {nat64} revealDate - The date when the time capsule can be revealed.
 * @property {Principal} owner - The owner of the time capsule.
 * @property {boolean} isRevealed - Whether the time capsule has been revealed.
 */
type TimeCapsule = Record<{
    id: string;
    message: string;
    revealDate: nat64;
    owner: Principal;
    isRevealed: boolean;
}>;

/**
 * Represents the payload required to create or update a personal time capsule.
 * @typedef {Object} TimeCapsulePayload
 * @property {string} message - The message to store in the time capsule.
 * @property {nat64} revealDate - The reveal date of the time capsule.
 * @property {Opt<string>} imageurl - Optional URL of an image.
 * @property {Opt<string>} videourl - Optional URL of a video.
 */
type TimeCapsulePayload = Record<{
    message: string;
    revealDate: nat64;
    imageurl: Opt<string>;
    videourl: Opt<string>;
}>;

/**
 * Represents media that can be stored in a community time capsule.
 * @typedef {Object} Media
 * @property {Opt<string>} message - Optional message.
 * @property {Opt<string>} photoUrl - Optional URL of a photo.
 * @property {Opt<string>} videoUrl - Optional URL of a video.
 */
type Media = Record<{
    message: Opt<string>;
    photoUrl: Opt<string>;
    videoUrl: Opt<string>;
}>;

/**
 * Represents a community time capsule.
 * @typedef {Object} CommunityTimeCapsule
 * @property {string} id - The unique identifier of the community time capsule.
 * @property {nat64} revealDate - The date when the community time capsule can be revealed.
 * @property {Principal} owner - The owner of the community time capsule.
 * @property {boolean} isRevealed - Whether the community time capsule has been revealed.
 * @property {Vec<Principal>} memberPrincipal - List of members' principals.
 * @property {Vec<Media>} memberMedia - List of media associated with members.
 */
type CommunityTimeCapsule = Record<{
    id: string;
    revealDate: nat64;
    owner: Principal;
    isRevealed: boolean;
    memberPrincipal: Vec<Principal>;
    memberMedia: Vec<Media>;
}>;

/**
 * Represents the payload required to create a community time capsule.
 * @typedef {Object} CommunityTimeCapsulePayload
 * @property {nat64} revealDate - The reveal date of the community time capsule.
 * @property {Vec<Principal>} members - List of members to be added to the community time capsule.
 * @property {Vec<Media>} media - List of media associated with members.
 */
type CommunityTimeCapsulePayload = Record<{
    revealDate: nat64;
    members: Vec<Principal>;
    media: Vec<Media>;
}>;

// Creating storage for personal and community time capsules
const timeCapsuleStorage = new StableBTreeMap<string, TimeCapsule>(0, 44, 1024);
const communitytimecapsuleStorage = new StableBTreeMap<string, CommunityTimeCapsule>(1, 44, 1024);

/**
 * Creates a new personal time capsule.
 * @param {TimeCapsulePayload} payload - The data for the time capsule, including the message, reveal date, and optional image and video URLs.
 * @returns {Result<TimeCapsule, string>} The created time capsule or an error message.
 */
$update;
export function createTimeCapsule(payload: TimeCapsulePayload): Result<TimeCapsule, string> {
    const timeCapsule: TimeCapsule = {
        id: uuidv4(),
        owner: ic.caller(),
        isRevealed: false,
        ...payload,
    };

    timeCapsuleStorage.insert(timeCapsule.id, timeCapsule);
    return Result.Ok(timeCapsule);
}

/**
 * Retrieves a personal time capsule by its ID.
 * @param {string} id - The ID of the time capsule.
 * @returns {Result<TimeCapsule, string>} The time capsule if the reveal date has passed, or an error message.
 */
$query;
export function retrieveTimeCapsule(id: string): Result<TimeCapsule, string> {
    return match(timeCapsuleStorage.get(id), {
        Some: (timeCapsule: TimeCapsule) => {
            const currentTime = ic.time();
            if (currentTime >= timeCapsule.revealDate) {
                if (!timeCapsule.isRevealed) {
                    timeCapsule.isRevealed = true;
                    timeCapsuleStorage.insert(timeCapsule.id, timeCapsule);  // Update the capsule status
                    return Result.Ok<TimeCapsule, string>(timeCapsule);
                } else {
                    return Result.Err<TimeCapsule, string>("This TimeCapsule has already been revealed.");
                }
            } else {
                return Result.Err<TimeCapsule, string>("The reveal date for this TimeCapsule has not arrived yet.");
            }
        },
        None: () => Result.Err<TimeCapsule, string>("No TimeCapsule found with the provided id."),
    });
}

/**
 * Updates an existing personal time capsule.
 * @param {string} id - The ID of the time capsule to update.
 * @param {TimeCapsulePayload} payload - The new data for the time capsule.
 * @returns {Result<TimeCapsule, string>} The updated time capsule or an error message.
 */
$update;
export function updateTimeCapsule(id: string, payload: TimeCapsulePayload): Result<TimeCapsule, string> {
    return match(timeCapsuleStorage.get(id), {
        Some: (timeCapsule: TimeCapsule) => {
            if (ic.caller().toString() !== timeCapsule.owner.toString()) {
                return Result.Err<TimeCapsule, string>("You are not authorized to update this TimeCapsule.");
            }

            const updatedCapsule: TimeCapsule = { ...timeCapsule, ...payload };
            timeCapsuleStorage.insert(id, updatedCapsule);
            return Result.Ok<TimeCapsule, string>(updatedCapsule);
        },
        None: () => Result.Err<TimeCapsule, string>("No TimeCapsule found with the provided id."),
    });
}

/**
 * Creates a new community time capsule.
 * @param {CommunityTimeCapsulePayload} payload - The data for the community time capsule, including the reveal date, members, and media.
 * @returns {Result<CommunityTimeCapsule, string>} The created community time capsule or an error message.
 */
$update;
export function createCommunityTimeCapsule(payload: CommunityTimeCapsulePayload): Result<CommunityTimeCapsule, string> {
    const communityTimeCapsule: CommunityTimeCapsule = {
        id: uuidv4(),
        owner: ic.caller(),
        isRevealed: false,
        memberPrincipal: payload.members,
        memberMedia: payload.media,
        revealDate: payload.revealDate,
    };

    communitytimecapsuleStorage.insert(communityTimeCapsule.id, communityTimeCapsule);
    return Result.Ok(communityTimeCapsule);
}

// Polyfill for crypto in case it's not available
globalThis.crypto = {
    //@ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};
