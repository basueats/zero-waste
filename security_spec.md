# Firestore Security Specification

## Data Invariants
1. All `/academy_users/{userId}` documents must carry a valid `uid` matching `^[a-zA-Z0-9_\-]+$` (<= 128 chars), bounded strings (`email`, `name`, `planTitle`), valid enum values (`role`, `planId`, `paymentStatus`, `status`), and server timestamps (`createdAt`, `updatedAt`).
2. Self-registering members (`create`) can only create `role: 'member'`, `paymentStatus` in `['trial', 'unpaid', 'pending_approval']`, `status: 'active'`, `restrictedByAdmin: false`, and `uid == request.auth.uid`.
3. Members (`update`) cannot self-escalate `role`, `planId`, `paymentStatus`, `amountPaid`, `email`, or `createdAt`.
4. All `/academy_logs/{logId}` writes by non-admins must match `incoming().uid == request.auth.uid` and `timestamp == request.time`.
5. Only verified Administrators (`admins/{uid}` or verified runtime admin emails `basueats@gmail.com` / `supritamone@gmail.com`) can list all users, list all logs, approve paid plans, restrict/unrestrict other users, or delete records.

## Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `/academy_users/anyUser` -> Denied (`isSignedIn()`).
2. Unauthenticated list of `/academy_users` -> Denied (`isSignedIn()`).
3. Member A reading Member B's `/academy_users/memberB` -> Denied (`isOwner` / `isAdmin`).
4. Member setting `role: 'admin'` on `create` -> Denied (`incoming().role == 'member'`).
5. Member setting `paymentStatus: 'paid'` on `create` without Admin -> Denied (`paymentStatus in ['trial', 'unpaid', 'pending_approval']`).
6. Member injecting an extra ghost field (`isVerified: true`) on `create` or `update` -> Denied (`hasOnly(...)` / `affectedKeys().hasOnly(...)`).
7. Member updating `paymentStatus` or `planId` or `amountPaid` on `update` -> Denied (immutable to non-admins).
8. Member forging `createdAt` or `updatedAt` timestamp -> Denied (`request.time` check).
9. Unverified email spoof trying to pass `isAdmin()` -> Denied (`email_verified == true`).
10. Over-sized 200KB `userId` path or 10KB `name` string -> Denied (`isValidId` + `.size()` limits).
11. Member writing a log entry impersonating another `uid` -> Denied (`incoming().uid == request.auth.uid`).
12. Member creating or deleting `/admins/{uid}` -> Denied (`isAdmin()` only).
