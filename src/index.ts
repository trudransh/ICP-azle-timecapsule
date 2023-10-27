import {
    $update,
    $query,
    Result,
    nat64,
    ic,
    Opt,
    Principal,
    Record,
    match,
    StableBTreeMap,
    Vec,
    api,
} from "azle";
import { v4 as uuidv4 } from "uuid";

type TimeCapsule = Record<{
    id: string;
    message: string;
    revealDate: nat64;
    owner: Principal;
    isRevealed: boolean;
}>;

type TimeCapsulePayload = Record<{
    message: string;
    revealDate: nat64;
    imageurl: Opt<string>;
    videourl: Opt<string>;
}>;

type Media = Record<{
    message: Opt<string>;
    photoUrl: Opt<string>;
    videoUrl: Opt<string>;
}>;

type CommunityTimeCapsule = Record<{
    id: string;
    revealDate: nat64;
    owner: Principal;
    isRevealed: boolean;
    memberPrincipal: Vec<Principal>;
    memberMedia: Vec<Media>;
}>;

type CommunityTimeCapsulePayload = Record<{
    revealDate: nat64;
    members: Vec<Principal>;
    media: Vec<Media>;
}>;

const timeCapsuleStorage = new StableBTreeMap<string, TimeCapsule>(0, 44, 1024);
const communitytimecapsuleStorage = new StableBTreeMap<string, CommunityTimeCapsule>(1, 44, 1024);

function checkIsOwner(timeCapsule: TimeCapsule, caller: Principal): boolean {
    return timeCapsule.owner.toString() === caller.toString();
}

function checkRevealDatePassed(revealDate: nat64): boolean {
    const currentTime = ic.time();
    return currentTime >= revealDate;
}

function validateTimeCapsulePayload(payload: TimeCapsulePayload): boolean {
    // Add custom validation logic here, e.g., check message length, URL format, etc.
    return payload.message.length <= 100; // Example validation: Message length should not exceed 100 characters.
}

$update;
export function createTimeCapsule(payload: TimeCapsulePayload): Result<TimeCapsule, string> {
    const caller = ic.caller();

    if (!validateTimeCapsulePayload(payload)) {
        return Result.Err("Invalid payload. Please check your input.");
    }

    const timeCapsule: TimeCapsule = {
        id: uuidv4(),
        owner: caller,
        isRevealed: false,
        ...payload,
    };

    timeCapsuleStorage.insert(timeCapsule.id, timeCapsule);
    api.createTimeCapsuleEvent({ caller, id: timeCapsule.id, revealDate: timeCapsule.revealDate });

    return Result.Ok(timeCapsule);
}

$query;
export function retrieveTimeCapsule(id: string): Result<TimeCapsule, string> {
    const timeCapsule = timeCapsuleStorage.get(id);

    if (timeCapsule === null) {
        return Result.Err("No TimeCapsule found with the provided id.");
    }

    if (!checkRevealDatePassed(timeCapsule.revealDate)) {
        return Result.Err("The reveal date for this TimeCapsule has not arrived yet.");
    }

    if (timeCapsule.isRevealed) {
        return Result.Err("This TimeCapsule has already been revealed.");
    }

    timeCapsule.isRevealed = true;
    timeCapsuleStorage.insert(timeCapsule.id, timeCapsule);
    api.revealTimeCapsuleEvent({ caller: ic.caller(), id: timeCapsule.id });

    return Result.Ok(timeCapsule);
}

$update;
export function updateTimeCapsule(id: string, payload: TimeCapsulePayload): Result<TimeCapsule, string> {
    const timeCapsule = timeCapsuleStorage.get(id);

    if (timeCapsule === null) {
        return Result.Err("No TimeCapsule found with the provided id.");
    }

    if (!checkIsOwner(timeCapsule, ic.caller())) {
        return Result.Err("You are not authorized to update this TimeCapsule.");
    }

    if (!validateTimeCapsulePayload(payload)) {
        return Result.Err("Invalid payload. Please check your input.");
    }

    const updatedCapsule: TimeCapsule = { ...timeCapsule, ...payload };
    timeCapsuleStorage.insert(id, updatedCapsule);
    api.updateTimeCapsuleEvent({ caller: ic.caller(), id, revealDate: updatedCapsule.revealDate });

    return Result.Ok(updatedCapsule);
}

$update;
export function createCommunityTimeCapsule(payload: CommunityTimeCapsulePayload): Result<CommunityTimeCapsule, string> {
    const caller = ic.caller();
    
    // Implement reentrancy protection and gas limit handling as needed
    
    const communityTimeCapsule: CommunityTimeCapsule = {
        id: uuidv4(),
        owner: caller,
        isRevealed: false,
        memberPrincipal: payload.members,
        memberMedia: payload.media,
        revealDate: payload.revealDate,
    };

    communitytimecapsuleStorage.insert(communityTimeCapsule.id, communityTimeCapsule);
    api.createCommunityTimeCapsuleEvent({ caller, id: communityTimeCapsule.id, revealDate: communityTimeCapsule.revealDate });

    return Result.Ok(communityTimeCapsule);
}

// Gas Estimation Function
export function estimateGasForOperation(operation: string): nat64 {
    // Implement gas estimation logic based on the operation
    // You can use a predefined table of gas costs for different operations or estimate based on complexity.
    const gasCost = 1000000; // Example: Set a fixed gas cost for the operation.
    return gasCost;
}
