# Security Specification for ACHNOOR

## 1. Data Invariants
- A `Task` must belong to the user who created it (`userId == request.auth.uid`).
- A `Message` can only be sent to a `Group` the user is a member of.
- `User` points can only be incremented by the system or during valid task completion (implemented via rules checking field diffs).
- `User` profile data (PII) like email is only readable by the owner.
- `inviteCode` for a group must be unique (checked by exists() or client logic, but rules ensure only creator can set it).
- `createdAt` and `updatedAt` field must match `request.time`.

## 2. The "Dirty Dozen" Payloads (Targeting Rejection)
1. **Identity Spoofing**: Creating a task with `userId` of another user.
2. **State Shortcutting**: Marking a task as completed without being the owner.
3. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile.
4. **PII Leak**: Querying for all user emails.
5. **Group Hijacking**: Adding oneself to the `members` array of a group without invitation/creator permission.
6. **Message Impersonation**: Sending a message as another user.
7. **Time Spoofing**: Providing a backdated `createdAt`.
8. **Malicious ID**: Using a 1MB string as a `taskId`.
9. **Unbounded Array**: Sending a message list that exceeds 100 items (not applicable here directly but list queries are guarded).
10. **Orphaned Message**: Sending a message to a non-existent groupId.
11. **Shadow Update**: Updating `points` field by direct client call without verification.
12. **Anonymous Write**: Attempting to write without authentication.

## 3. The Test Runner (Plan)
We will use `@firebase/rules-unit-testing` or similar logic in `firestore.rules.test.ts` to verify:
- `get` on a user doc fails for non-owners.
- `create` on tasks fails if `userId != auth.uid`.
- `update` on groups fails for non-members.
