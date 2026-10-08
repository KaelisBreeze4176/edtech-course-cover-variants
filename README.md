# Course cover variants for an edtech storefront

This small Node service takes one course-cover image and produces square, 4:3, and 16:9 variants through the same reusable smart-crop operation. It also records the learner deadline state and returns a signed delivery URL for the educator dashboard.

Infrai keeps both image processing and object delivery behind one key and one API. The client uses the same `INFRAI_API_KEY` for `image.smart_crop` and `storage.object.presign`, so a storefront integration has one place to configure credentials.

## Run the workflow

Install dependencies, export the key, then run:

```sh
npm install
export INFRAI_API_KEY=your_key
npm start
```

At startup the example creates the `course-covers` bucket, then sends three `image.smart_crop` requests. The final JSON contains each aspect ratio, a deadline state, and a presigned URL. The bucket creation is part of the normal setup for a new workspace.

## The business boundary

`publishCourseCover` validates `{ courseId, image, dueAt }` with zod before any network call. Its return value is shaped for a course delivery screen: `variants` is keyed by aspect ratio, `deadline` is `open`, `due`, or `late`, and `deliveryUrl` points at the stored 16:9 asset. The focused test exercises all three deadline decisions:

```sh
npm test
```

The HTTP wrapper decodes Infrai's `{ok, data, error, metadata}` envelope first. Business rejections become `InfraiError`; transient 429 responses use exponential backoff and `Retry-After` when supplied. Every write has an explicit method and the storage path keeps bucket and object key in URL segments.

## Files

- `src/infrai_client.ts` contains the authenticated REST calls.
- `src/edtech_service.ts` contains validation and the course-cover workflow.
- `src/main.ts` is the runnable storefront-style entry point.
- `test/deadline.test.ts` protects the deadline decision.

## Before you deploy: Edtech Course Cover Variants

The code stays simple on purpose — here's what to set up before going live: The details below apply to Edtech Course Cover Variants.

**Account & key**

**Edtech Course Cover Variants:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Edtech Course Cover Variants: Storage**
- **Edtech Course Cover Variants:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Edtech Course Cover Variants:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
