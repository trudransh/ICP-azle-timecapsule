// cannister code goes here
import {$update,$query,Result,nat64,ic,Opt,Principal,Record, match,StableBTreeMap,Vec} from "azle";
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
    members: Vec<Principal>; // Use Vec to define an array
    media: Vec<Media>;
}>;


const timeCapsuleStorage = new StableBTreeMap<string, TimeCapsule>(0, 44, 1024);
const communitytimecapsuleStorage = new StableBTreeMap<string, CommunityTimeCapsule>(1, 44, 1024); // TODO : Understand this fully and then complete this community functionality
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

$update;
export function createCommunityTimeCapsule(payload: CommunityTimeCapsulePayload): Result<CommunityTimeCapsule, string> {
    // const membersMap = new StableBTreeMap<Principal, Media>(2,44,1024);
    
    // // // Initialize members map with the provided members
    // // payload.members.forEach((member: Principal,index:number) => {
    // //     membersMap.insert(member, payload.media[index]);
    // // });

    
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


// $update;
// export function updateRevealDate()



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
  