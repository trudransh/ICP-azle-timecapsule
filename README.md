# ICP Time Capsule Smart Contract

This project implements a smart contract on the Internet Computer Protocol (ICP) to create personal and community time capsules. A time capsule allows users to store messages, images, and videos that can be revealed after a specific date.

## Features

- **Personal Time Capsule**: Users can create, retrieve, and update personal time capsules.
- **Community Time Capsule**: Users can create community time capsules with multiple members.

## Smart Contract Functions

### Personal Time Capsule

#### `createTimeCapsule(payload: TimeCapsulePayload): Result<TimeCapsule, string>`

Create a new personal time capsule.

- `payload`: The data for the time capsule, including the message, reveal date, and optional image and video URLs.
- Returns: The created time capsule or an error message.

#### `retrieveTimeCapsule(id: string): Result<TimeCapsule, string>`

Retrieve a personal time capsule by its ID.

- `id`: The ID of the time capsule.
- Returns: The time capsule if the reveal date has passed, or an error message.

#### `updateTimeCapsule(id: string, payload: TimeCapsulePayload): Result<TimeCapsule, string>`

Update an existing personal time capsule.

- `id`: The ID of the time capsule to update.
- `payload`: The new data for the time capsule.
- Returns: The updated time capsule or an error message.

### Community Time Capsule

#### `createCommunityTimeCapsule(payload: CommunityTimeCapsulePayload): Result<CommunityTimeCapsule, string>`

Create a new community time capsule.

- `payload`: The data for the community time capsule, including the reveal date, members, and media.
- Returns: The created community time capsule or an error message.

## Types

### `TimeCapsule`

- `id`: string - The unique identifier of the time capsule.
- `message`: string - The message stored in the time capsule.
- `revealDate`: nat64 - The date when the time capsule can be revealed.
- `owner`: Principal - The owner of the time capsule.
- `isRevealed`: boolean - Whether the time capsule has been revealed.

### `TimeCapsulePayload`

- `message`: string - The message to store in the time capsule.
- `revealDate`: nat64 - The reveal date of the time capsule.
- `imageurl`: Opt<string> - Optional URL of an image.
- `videourl`: Opt<string> - Optional URL of a video.

### `Media`

- `message`: Opt<string> - Optional message.
- `photoUrl`: Opt<string> - Optional URL of a photo.
- `videoUrl`: Opt<string> - Optional URL of a video.

### `CommunityTimeCapsule`

- `id`: string - The unique identifier of the community time capsule.
- `revealDate`: nat64 - The date when the community time capsule can be revealed.
- `owner`: Principal - The owner of the community time capsule.
- `isRevealed`: boolean - Whether the community time capsule has been revealed.
- `memberPrincipal`: Vec<Principal> - List of members' principals.
- `memberMedia`: Vec<Media> - List of media associated with members.

### `CommunityTimeCapsulePayload`

- `revealDate`: nat64 - The reveal date of the community time capsule.
- `members`: Vec<Principal> - List of members to be added to the community time capsule.
- `media`: Vec<Media> - List of media associated with members.

## Installation

1. Clone the repository: `git clone https://github.com/trudransh/ICP-azle-timecapsule.git`
2. Navigate to the project directory: `cd ICP-azle-timecapsule`
3. Install dependencies: `npm install`

## Usage

Deploy the smart contract to the Internet Computer and interact with it using DFINITY's SDK or any compatible tool.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
