import {$update,$query,StableBTreeMap,Result,nat64,ic,Opt,Principal,Record, match} from "azle";
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

const timeCapsuleStorage = new StableBTreeMap<string, TimeCapsule>(0, 44, 1024);

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
  