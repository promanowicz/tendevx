# Database Schema for Firestore

## Collections

### Users
- **id**: string (Firebase Auth user id, unique)
- **name**: string
- **email**: string
- **groups**: array of strings (references to group identifiers)

### Campaigns
- **uuid**: string (unique campaign identifier)
- **ownerId**: string (reference to a user via Firebase Auth user id)
- **title**: string
- **description**: string
- **groups**: array of strings (references to group identifiers)
- **createdAt**: timestamp
- **updatedAt**: timestamp

### Groups
- **id**: string (unique group identifier)
- **name**: string
- **description**: string (optional)

## Relations Between Collections
- Each document in the `Campaigns` collection has one owner, referenced via **ownerId** in the `Users` collection.
- Campaigns specify access through an array of group identifiers in **groups**.
- Users have an array field **groups** denoting their memberships in various groups.

## Additional Notes
- Identifiers (user id and campaign uuid) are enforced as unique.
- Data types (e.g., timestamp for dates) are chosen to accurately represent the information.
- Consistency is ensured through Firestore transactions and batch writes.
- Custom indexing and data partitioning are not required, as Firestore provides automatic indexing.