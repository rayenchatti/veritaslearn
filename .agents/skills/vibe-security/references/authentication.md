# Authentication & Authorization

## JWT Handling

- **Use `jwt.verify()`, never `jwt.decode()` alone.** `decode` reads the payload without checking the signature — an attacker can forge any payload.
- **Explicitly reject `"alg": "none"`.** Some JWT libraries accept unsigned tokens if the algorithm is set to `"none"`. Your verification must reject this.
- **Validate issuer, audience, and expiration** — not just the signature.

```typescript
// BAD: reads token without verifying signature
const payload = jwt.decode(token);

// GOOD: verifies signature, rejects tampered tokens
const payload = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'your-app',
});
```

## Server Actions Are Public Endpoints

Server Actions compile into public POST endpoints. Anyone can call them with `curl`. Every Server Action needs:

1. **Input validation** (Zod or similar runtime schema)
2. **Authentication** (verify the user is logged in)
3. **Authorization** (verify the user owns the resource)

```typescript
// BAD: no auth check, no input validation
'use server';
export async function deleteItem(id: string) {
  await db.items.delete({ where: { id } });
}

// GOOD: validates input, authenticates, and authorizes
'use server';
export async function deleteItem(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };

  const session = await auth();
  if (!session?.user) redirect('/login');

  await db.items.deleteMany({
    where: { id: parsed.data.id, userId: session.user.id }
  });
}
```

## Session & Token Storage

- Store tokens in `HttpOnly + Secure + SameSite=Lax` cookies, **not localStorage**.
- localStorage is accessible to any JavaScript on the page — a single XSS vulnerability exposes all tokens.
- `HttpOnly` cookies are invisible to JavaScript and sent automatically by the browser.

## Data Leakage to Client Components

Never pass entire database objects to client components. Select only the fields the client needs:

```typescript
// BAD: leaks all fields including internal ones
const user = await db.users.findUnique({ where: { id } });

// GOOD: select only needed fields
const user = await db.users.findUnique({
  where: { id },
  select: { name: true, avatarUrl: true }
});
```
